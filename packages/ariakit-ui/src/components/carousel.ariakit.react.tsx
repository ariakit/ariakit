import * as ak from "@ariakit/react";
import { useEvent, useMergeRefs } from "@ariakit/react-utils";
import { getActiveElement, getWindow } from "@ariakit/utils";
import type { RecipeLike, VariantProps, VariantPropsWithRecipe } from "clava";
import { splitProps } from "clava";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type * as React from "react";
import { createOptionalRender } from "../react-utils/create-render.react.ts";
import {
  carousel,
  carouselButton,
  carouselButtonArea,
  carouselSlide,
  carouselTab,
  carouselTabList,
  carouselViewport,
} from "../styles/carousel.ts";
import type { carouselViewportBase } from "../styles/carousel.ts";
import { Button } from "./button.ariakit.react.tsx";
import type { ButtonProps } from "./button.ariakit.react.tsx";

type CarouselKind = "row" | "slides";
type CarouselSide = "start" | "end";

// The fades and the buttons treat the last 2px at each end as the end, because
// Chromium can stop scrolling up to 1px before the end of the scroll timeline.
const END_TOLERANCE = 2;

// While a scroll that a button or a slide tab started runs, the slide tabs stay
// on its target, so they don't flicker through the slides in between.
const TARGET_TIMEOUT = 1200;

// The slide position text waits for scrolling to settle, so screen readers
// announce the slides that people stop on, not every slide on the way.
const STATUS_DELAY = 300;

function isRtl(element: HTMLElement) {
  return getWindow(element).getComputedStyle(element).direction === "rtl";
}

function getOffset(viewport: HTMLElement) {
  return Math.abs(viewport.scrollLeft);
}

function getMaxOffset(viewport: HTMLElement) {
  return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
}

interface ClearRange {
  left: number;
  right: number;
}

/**
 * Returns how far a row scrolls so that a box lies in the clear range between
 * the fades and the buttons: to the nearest edge of the range, or to its middle
 * when the box doesn't fit. Returns 0 when the box is already clear.
 */
function getClearOffset(rect: DOMRect, clear: ClearRange) {
  if (rect.width > clear.right - clear.left) {
    return rect.left + rect.width / 2 - (clear.left + clear.right) / 2;
  }
  if (rect.left < clear.left) {
    return rect.left - clear.left;
  }
  if (rect.right > clear.right) {
    return rect.right - clear.right;
  }
  return 0;
}

interface GetSnapOffsetParams {
  rect: DOMRect;
  clear: ClearRange;
  /** The computed `scroll-snap-align` of the item. */
  align: string;
  rtl: boolean;
}

/**
 * Returns how far a row scrolls so that an item that snaps lies at its own snap
 * position, with the edge that it snaps to on the clear range. A scroll to the
 * nearest edge could stop closer to the snap position where the row is, and the
 * row would snap back. An item that doesn't snap takes the nearest edge.
 */
function getSnapOffset({ rect, clear, align, rtl }: GetSnapOffsetParams) {
  // The inline value comes last, as in "none start".
  const inline = align.split(" ").at(-1);
  if (inline === "center") {
    return rect.left + rect.width / 2 - (clear.left + clear.right) / 2;
  }
  if (inline !== "start" && inline !== "end") {
    return getClearOffset(rect, clear);
  }
  const alignsLeft = (inline === "start") !== rtl;
  if (alignsLeft) {
    return rect.left - clear.left;
  }
  return rect.right - clear.right;
}

function getScrollPadding(viewport: HTMLElement) {
  const style = getWindow(viewport).getComputedStyle(viewport);
  return {
    start: Number.parseFloat(style.scrollPaddingInlineStart) || 0,
    end: Number.parseFloat(style.scrollPaddingInlineEnd) || 0,
  };
}

/**
 * The distance from the start of the scrollable content to the start of an
 * element, in the writing direction.
 */
function getStartOffset(viewport: HTMLElement, element: Element) {
  const viewportRect = viewport.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const offset = getOffset(viewport);
  if (isRtl(viewport)) return viewportRect.right - rect.right + offset;
  return rect.left - viewportRect.left + offset;
}

function scrollToOffset(
  viewport: HTMLElement,
  offset: number,
  instant = false,
) {
  const target = Math.min(Math.max(0, offset), getMaxOffset(viewport));
  const reducedMotion = getWindow(viewport).matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  viewport.scrollTo({
    left: isRtl(viewport) ? -target : target,
    behavior: instant || reducedMotion ? "instant" : "smooth",
  });
}

/**
 * Finds where one step of a row button scrolls to, for the `$step` that the
 * viewport publishes through custom properties.
 */
function getRowStepTarget(viewport: HTMLElement, side: CarouselSide) {
  const offset = getOffset(viewport);
  const padding = getScrollPadding(viewport);
  const direction = side === "end" ? 1 : -1;
  const style = getWindow(viewport).getComputedStyle(viewport);
  const step = style.getPropertyValue("--carousel-step").trim();
  if (step === "item") {
    // Each item scrolls to the start of the visible part of the row. An item
    // that would move less than the scroll padding is skipped, so a press
    // doesn't move the row by just a few pixels.
    const minStep = Math.max(1, padding.start);
    const targets = Array.from(
      viewport.children,
      (child) => getStartOffset(viewport, child) - padding.start,
    );
    const next =
      side === "end"
        ? targets.find((target) => target >= offset + minStep)
        : targets.findLast((target) => target <= offset - minStep);
    if (next == null) return side === "end" ? getMaxOffset(viewport) : 0;
    return next;
  }
  const visibleWidth = viewport.clientWidth - padding.start - padding.end;
  // A narrow row still moves by half its width, so the fades and the buttons
  // never leave a step too short to be useful.
  const distance = Math.max(visibleWidth, viewport.clientWidth / 2);
  return offset + direction * distance;
}

/**
 * Finds where a row button scrolls to. A step that would leave less than the
 * scroll padding, which the fade and the button cover, goes on to the end, so
 * the last press doesn't move the row by just a few pixels.
 */
function getRowTarget(viewport: HTMLElement, side: CarouselSide) {
  const target = getRowStepTarget(viewport, side);
  const padding = getScrollPadding(viewport);
  if (side === "start") return target < padding.start ? 0 : target;
  const max = getMaxOffset(viewport);
  return max - target < padding.end ? max : target;
}

interface SlideItem {
  id: string;
  element: HTMLElement;
}

/**
 * The slide whose start matches the scroll position. With several slides per
 * view, the last slides all scroll to the end of the row, so the end shows
 * `pickedId` when it's one of them. Otherwise, it shows the last slide, or the
 * first one in a row that doesn't overflow.
 */
function getCurrentSlide(
  viewport: HTMLElement,
  slides: SlideItem[],
  pickedId?: string,
) {
  if (!slides.length) return;
  const offset = getOffset(viewport);
  const padding = getScrollPadding(viewport);
  const getStart = (slide: SlideItem) =>
    getStartOffset(viewport, slide.element) - padding.start;
  const max = getMaxOffset(viewport);
  if (max - offset <= END_TOLERANCE) {
    const picked = slides.find((slide) => slide.id === pickedId);
    if (picked && max - getStart(picked) <= END_TOLERANCE) return picked;
    // A row that doesn't overflow is at both ends.
    if (offset <= END_TOLERANCE) return slides[0];
    return slides.at(-1);
  }
  if (offset <= END_TOLERANCE) return slides[0];
  let current = slides[0];
  let currentDistance = Number.POSITIVE_INFINITY;
  for (const slide of slides) {
    const distance = Math.abs(getStart(slide) - offset);
    if (distance >= currentDistance) continue;
    current = slide;
    currentDistance = distance;
  }
  return current;
}

/** The text that tells screen readers which slides show. */
function getSlideStatus(viewport: HTMLElement, slides: SlideItem[]) {
  const viewportRect = viewport.getBoundingClientRect();
  const shown: number[] = [];
  slides.forEach((slide, index) => {
    const rect = slide.element.getBoundingClientRect();
    const visible =
      Math.min(rect.right, viewportRect.right) -
      Math.max(rect.left, viewportRect.left);
    if (visible > rect.width / 2) {
      shown.push(index + 1);
    }
  });
  const first = shown[0];
  const last = shown.at(-1);
  if (first == null || last == null) return "";
  if (first === last) return `Showing slide ${first} of ${slides.length}`;
  return `Showing slides ${first} to ${last} of ${slides.length}`;
}

function getSlideItems(
  renderedItems?: ak.CollectionStoreState["renderedItems"],
) {
  if (!renderedItems) return [];
  const items: SlideItem[] = [];
  for (const item of renderedItems) {
    if (!item.element) continue;
    items.push({ id: item.id, element: item.element });
  }
  return items;
}

function getSideButton(viewport: HTMLElement, side: CarouselSide) {
  const parent = viewport.parentElement;
  if (!parent) return null;
  return parent.querySelector<HTMLElement>(
    `:scope > * > [data-carousel-button="${side}"]`,
  );
}

interface UseCarouselParams {
  kind: CarouselKind;
  /** The slides of a carousel with `kind: "slides"`, in DOM order. */
  collection?: ak.CollectionStore;
  /** The id of the slide at the start of the row. */
  selectedId?: string;
  /** The id of the slide to show first, when `selectedId` is uncontrolled. */
  defaultSelectedId?: string;
  /** Called with the id of the slide at the start of the row. */
  setSelectedId?: (selectedId: string) => void;
}

/**
 * Tracks the scroll state of a carousel viewport and scrolls it. Script keeps
 * the states that CSS can't: `aria-disabled` on the buttons, the selected slide
 * tab, and the slide position text.
 */
function useCarousel({
  kind,
  collection,
  selectedId: selectedIdProp,
  defaultSelectedId,
  setSelectedId: setSelectedIdProp,
}: UseCarouselParams) {
  const [viewport, setViewport] = useState<HTMLElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [internalSelectedId, setInternalSelectedId] =
    useState(defaultSelectedId);
  const selectedId = selectedIdProp ?? internalSelectedId;
  const [status, setStatus] = useState("");
  const onSelectedIdChange = useEvent(setSelectedIdProp);
  // The last selection that the carousel showed or reported, so a controlled
  // value that matches it doesn't scroll again.
  const reportedIdRef = useRef(selectedId);
  // A slide to go to once its element registers, such as the first one.
  const pendingIdRef = useRef(selectedId);
  const targetRef = useRef<string>(undefined);
  const targetTimerRef = useRef(0);
  // The slide that a press, a slide tab, or `selectedId` went to last. At the
  // end of a row with several slides per view, it stays selected after its
  // target times out, until the row scrolls away from the end.
  const pickedIdRef = useRef<string>(undefined);
  // Whether the carousel moved by a scroll, a press, or a slide tab. Until it
  // does, the status stays quiet.
  const movedRef = useRef(false);
  const updateRef = useRef<() => void>(undefined);
  const placePendingRef = useRef<() => void>(undefined);
  // Added or removed slides change the selection without a scroll or a resize,
  // so the effect below runs again with them.
  const renderedItems = ak.useStoreState(collection, "renderedItems");

  useEffect(() => {
    if (!viewport) return;
    // The viewport can be in another document, such as an iframe.
    const win = getWindow(viewport);
    let frame = 0;
    let statusTimer = 0;
    // The slides that show, as the status reads them. The status speaks only
    // when they change after the carousel moved, so placing the first slide, or
    // a resize that snaps back to the same slides, stays quiet.
    let shownStatus = "";

    const moveFocusFromEnd = (side: CarouselSide) => {
      const button = getSideButton(viewport, side);
      if (!button) return;
      if (getActiveElement(button) !== button) return;
      const other = getSideButton(viewport, side === "start" ? "end" : "start");
      other?.focus();
    };

    const update = () => {
      // A hidden viewport, such as one in a tab panel that isn't selected, has
      // no box to measure, so the carousel keeps its state until it shows.
      if (!viewport.clientWidth) return;
      const offset = getOffset(viewport);
      const max = getMaxOffset(viewport);
      const nextAtStart = offset <= END_TOLERANCE;
      const nextAtEnd = max - offset <= END_TOLERANCE;
      setAtStart(nextAtStart);
      setAtEnd(nextAtEnd);
      setRtl(isRtl(viewport));
      // Row buttons hide at their end, so a focused one hands focus to the
      // other button first.
      if (kind === "row") {
        if (nextAtStart) moveFocusFromEnd("start");
        if (nextAtEnd) moveFocusFromEnd("end");
        return;
      }
      const slides = getSlideItems(renderedItems);
      if (!nextAtEnd && !targetRef.current) {
        pickedIdRef.current = undefined;
      }
      const current = getCurrentSlide(viewport, slides, pickedIdRef.current);
      const target = targetRef.current;
      const hasTarget = slides.some((slide) => slide.id === target);
      if (target && (target === current?.id || !hasTarget)) {
        targetRef.current = undefined;
      }
      const nextId = pendingIdRef.current ?? targetRef.current ?? current?.id;
      if (nextId && nextId !== reportedIdRef.current) {
        reportedIdRef.current = nextId;
        setInternalSelectedId(nextId);
        onSelectedIdChange(nextId);
      }
      if (!movedRef.current) {
        shownStatus = getSlideStatus(viewport, slides);
        return;
      }
      clearTimeout(statusTimer);
      statusTimer = window.setTimeout(() => {
        if (!viewport.clientWidth) return;
        const text = getSlideStatus(viewport, slides);
        if (text === shownStatus) return;
        shownStatus = text;
        setStatus(text);
      }, STATUS_DELAY);
    };

    const schedule = () => {
      win.cancelAnimationFrame(frame);
      frame = win.requestAnimationFrame(update);
    };

    const onScroll = () => {
      movedRef.current = true;
      schedule();
    };

    // The browser scrolls a focused element into view only when it lies outside
    // the viewport, so an element under a fade or a button would stay there.
    // The scroll padding covers them, and a scroll to the nearest edge keeps
    // the element clear of it. In a row too narrow to fit the element between
    // them, the nearest edge would cut its other end, so the element goes to
    // the middle of the row instead. A press focuses the element before its
    // click, so a scroll then would move the element away from the pointer, and
    // only keyboard focus scrolls. A viewport that snaps would snap a scroll to
    // the element back to where it was, so it scrolls the item that holds the
    // element, which can snap. An item that doesn't fit would go to the middle
    // of the row, with an element at its edge under a fade, so the element
    // scrolls instead. A text field that a press focuses matches :focus-visible
    // too, so the carousel also skips the focus that comes during a press. A
    // tap sends its mousedown after the pointer lifts, before the focus.
    let pressing = false;
    const onMouseDown = () => {
      pressing = true;
    };
    // A drag or a context menu can end the press without a mouseup, and a key
    // press means the next focus comes from the keyboard.
    const onPressEnd = () => {
      pressing = false;
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof win.Element)) return;
      // Firefox can focus the viewport itself, which holds every item.
      if (target === viewport) return;
      if (pressing) return;
      if (!target.matches(":focus-visible")) return;
      const style = win.getComputedStyle(viewport);
      const viewportRect = viewport.getBoundingClientRect();
      const viewportLeft = viewportRect.left + viewport.clientLeft;
      const viewportRight = viewportLeft + viewport.clientWidth;
      const clear = {
        left: viewportLeft + (Number.parseFloat(style.scrollPaddingLeft) || 0),
        right:
          viewportRight - (Number.parseFloat(style.scrollPaddingRight) || 0),
      };
      const fits = (element: Element) =>
        element.getBoundingClientRect().width <= clear.right - clear.left;
      const snapItem =
        style.scrollSnapType !== "none"
          ? Array.from(viewport.children).find((child) =>
              child.contains(target),
            )
          : undefined;
      const snaps = snapItem != null && fits(snapItem);
      const item = snaps ? snapItem : target;
      // Fractional widths can leave an item a fraction of a pixel past the
      // clear range, which still shows it whole.
      const getItemOffset = () => {
        const offset = getClearOffset(item.getBoundingClientRect(), clear);
        return Math.abs(offset) < 1 ? 0 : offset;
      };
      const offset = getItemOffset();
      if (!offset) return;
      // The carousel scrolls the viewport alone. scrollIntoView would also
      // scroll the page to show the whole item, and Chrome and Firefox miss the
      // middle of a row whose scroll padding takes the whole row. A scroll to a
      // position snaps to the closest item, where a scroll by an offset would
      // snap to the next one. The scroll is instant, so a viewport that scrolls
      // smoothly already shows the item where it stops when it's measured
      // again.
      viewport.scrollTo({
        left: viewport.scrollLeft + offset,
        behavior: "instant",
      });
      if (!snaps) return;
      // The nearest edge can lie closer to the snap position where the row was
      // than to the one of the item, so the row snaps back. The item then goes
      // to its own snap position.
      if (!getItemOffset()) return;
      const snapOffset = getSnapOffset({
        rect: item.getBoundingClientRect(),
        clear,
        align: win.getComputedStyle(item).scrollSnapAlign,
        rtl: style.direction === "rtl",
      });
      viewport.scrollTo({
        left: viewport.scrollLeft + snapOffset,
        behavior: "instant",
      });
    };

    updateRef.current = update;
    update();
    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("focusin", onFocusIn);
    viewport.addEventListener("mousedown", onMouseDown, true);
    win.addEventListener("mouseup", onPressEnd, true);
    win.addEventListener("keydown", onPressEnd, true);
    // Items can grow while the viewport keeps its size, such as when an image
    // or a font loads, so the observer watches each item too.
    const resizeObserver = new win.ResizeObserver(() => {
      // A slide that waited for a hidden viewport takes its place here, after
      // layout and before the browser paints the first slide.
      placePendingRef.current?.();
      schedule();
    });
    const observeItems = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(viewport);
      for (const item of viewport.children) {
        resizeObserver.observe(item);
      }
    };
    observeItems();
    // Added or removed items change the scroll width without a resize.
    const mutationObserver = new win.MutationObserver((records) => {
      if (records.some((record) => record.target === viewport)) {
        observeItems();
      }
      schedule();
    });
    mutationObserver.observe(viewport, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    // A class or style on the viewport, such as a wider $gap, can change the
    // scroll width while no box resizes.
    const attributeObserver = new win.MutationObserver(schedule);
    attributeObserver.observe(viewport, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
    return () => {
      win.cancelAnimationFrame(frame);
      clearTimeout(statusTimer);
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("focusin", onFocusIn);
      viewport.removeEventListener("mousedown", onMouseDown, true);
      win.removeEventListener("mouseup", onPressEnd, true);
      win.removeEventListener("keydown", onPressEnd, true);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      attributeObserver.disconnect();
      updateRef.current = undefined;
    };
  }, [viewport, kind, renderedItems, onSelectedIdChange]);

  // Returns whether the slide was there to scroll to.
  const goToSlide = useCallback(
    (id: string, instant = false) => {
      if (!viewport) return false;
      // A hidden viewport has no positions, so the slide waits until it shows.
      if (!viewport.clientWidth) return false;
      const slide = getSlideItems(renderedItems).find((item) => item.id === id);
      if (!slide) return false;
      targetRef.current = id;
      pickedIdRef.current = id;
      // An instant move only places a slide that waited, such as the first one.
      // Other moves come from a press, a slide tab, or `selectedId`, and
      // reduced motion can scroll them at once, before the scroll event.
      if (!instant) {
        movedRef.current = true;
      }
      clearTimeout(targetTimerRef.current);
      targetTimerRef.current = window.setTimeout(() => {
        targetRef.current = undefined;
        updateRef.current?.();
      }, TARGET_TIMEOUT);
      const padding = getScrollPadding(viewport);
      scrollToOffset(
        viewport,
        getStartOffset(viewport, slide.element) - padding.start,
        instant,
      );
      updateRef.current?.();
      return true;
    },
    [viewport, renderedItems],
  );

  const scrollToSlide = useCallback(
    (id: string) => {
      goToSlide(id);
    },
    [goToSlide],
  );

  // The first slide shows at once, without a scroll that people can see. A
  // hidden viewport keeps the slide pending, and the resize observer places it
  // once the viewport shows.
  useEffect(() => {
    const placePending = () => {
      const id = pendingIdRef.current;
      if (!id) return;
      const instant = !reportedIdRef.current || id === reportedIdRef.current;
      if (!goToSlide(id, instant)) return;
      pendingIdRef.current = undefined;
    };
    placePendingRef.current = placePending;
    placePending();
  }, [goToSlide]);

  // A controlled selection that the carousel didn't report scrolls to it.
  useEffect(() => {
    if (!selectedIdProp) return;
    if (selectedIdProp === reportedIdRef.current) return;
    reportedIdRef.current = selectedIdProp;
    pendingIdRef.current = selectedIdProp;
    if (!goToSlide(selectedIdProp)) return;
    pendingIdRef.current = undefined;
  }, [selectedIdProp, goToSlide]);

  const scrollToward = useCallback(
    (side: CarouselSide) => {
      if (!viewport) return;
      if (kind === "row") {
        scrollToOffset(viewport, getRowTarget(viewport, side));
        return;
      }
      // Slides scroll to the position of a slide, because WebKit ignores
      // mandatory snapping for a smooth scroll by a distance. The step starts
      // where a running scroll goes, or at the scroll position, and skips the
      // slides that scroll to the same place, such as the last slides when
      // several show at the end of the row.
      const slides = getSlideItems(renderedItems);
      const padding = getScrollPadding(viewport);
      const max = getMaxOffset(viewport);
      const getSlideOffset = (slide: SlideItem) => {
        const offset = getStartOffset(viewport, slide.element) - padding.start;
        return Math.min(Math.max(0, offset), max);
      };
      const target = slides.find((slide) => slide.id === targetRef.current);
      const from = target ? getSlideOffset(target) : getOffset(viewport);
      const next =
        side === "end"
          ? slides.find((slide) => getSlideOffset(slide) > from + END_TOLERANCE)
          : slides.findLast(
              (slide) => getSlideOffset(slide) < from - END_TOLERANCE,
            );
      if (!next) return;
      scrollToSlide(next.id);
    },
    [viewport, kind, renderedItems, scrollToSlide],
  );

  useEffect(() => {
    return () => clearTimeout(targetTimerRef.current);
  }, []);

  return {
    viewport,
    setViewport,
    atStart,
    atEnd,
    rtl,
    selectedId,
    status,
    scrollToward,
    scrollToSlide,
  };
}

type CarouselState = ReturnType<typeof useCarousel>;

interface CarouselButtonLabels {
  start: string;
  end: string;
}

interface GetCarouselButtonPropsParams {
  state: Pick<CarouselState, "atStart" | "atEnd" | "scrollToward">;
  side: CarouselSide;
  labels: CarouselButtonLabels;
  controls?: string;
}

/**
 * Returns the default props of a previous or next button. The buttons go before
 * and after the viewport, so the Tab order follows the reading order.
 */
function getCarouselButtonProps({
  state,
  side,
  labels,
  controls,
}: GetCarouselButtonPropsParams) {
  const disabled = side === "start" ? state.atStart : state.atEnd;
  // Script finds the buttons beside the viewport through this attribute.
  const dataProps = { "data-carousel-button": side };
  return {
    ...dataProps,
    $side: side,
    "aria-label": labels[side],
    "aria-controls": controls,
    disabled,
    accessibleWhenDisabled: true,
    // A pointer press keeps focus where it was, such as on the selected tab.
    onMouseDown: (event: React.MouseEvent) => event.preventDefault(),
    onClick: () => state.scrollToward(side),
  };
}

/**
 * Scrolls the viewport with a wheel or a trackpad over an element beside it,
 * such as a button, which would scroll the page instead. A mostly vertical
 * swipe still scrolls the page, as it does over the viewport.
 */
function useWheelScroll(
  element: HTMLElement | null,
  viewport?: HTMLElement | null,
) {
  useEffect(() => {
    if (!element) return;
    if (!viewport) return;
    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented) return;
      // The browser still scrolls for an event that can't be canceled, such as
      // a late event of a swipe, so a scroll here would add to its own.
      if (!event.cancelable) return;
      // Firefox reports lines when a script reads deltaMode before the deltas,
      // so the deltas come first.
      const { deltaX, deltaY } = event;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) return;
      if (event.deltaMode !== event.DOM_DELTA_PIXEL) return;
      // A script scroll snaps after each step, so a viewport that snaps, such
      // as one of slides, would stay where it was.
      const style = getWindow(viewport).getComputedStyle(viewport);
      if (style.scrollSnapType !== "none") return;
      event.preventDefault();
      viewport.scrollBy({ left: deltaX, behavior: "instant" });
    };
    // A passive listener can't stop the page from scrolling.
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [element, viewport]);
}

/** A previous or next button, as `true`, an element, or props. */
export type CarouselButtonRender =
  | boolean
  | React.ReactElement
  | CarouselButtonProps;

interface CarouselContextValue {
  kind: CarouselKind;
  showButtons: boolean;
  previousButton: CarouselButtonRender;
  nextButton: CarouselButtonRender;
  collection: ak.CollectionStore;
  state: CarouselState;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarouselContext(name: string) {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error(`${name} must be rendered inside a Carousel component.`);
  }
  return context;
}

const ROW_LABELS: CarouselButtonLabels = {
  start: "Scroll backward",
  end: "Scroll forward",
};

const SLIDE_LABELS: CarouselButtonLabels = {
  start: "Previous slide",
  end: "Next slide",
};

export type CarouselProps<
  R extends RecipeLike<typeof carousel, R> = typeof carousel,
> = ak.RoleProps &
  VariantPropsWithRecipe<typeof carousel, R> & {
    /**
     * The style recipe applied in place of `carousel`, such as one for a tab
     * strip. It must supply every `carousel` variant.
     */
    recipe?: R;
    /**
     * Renders the previous and next buttons beside the viewport. Defaults to
     * `true`.
     */
    buttons?: boolean;
    /**
     * The previous button, as `true`, an element, or `CarouselButton` props.
     * `false` omits it. Defaults to a button named "Previous slide", or "Scroll
     * backward" with `$kind="row"`.
     */
    previousButton?: CarouselButtonRender;
    /**
     * The next button, as `true`, an element, or `CarouselButton` props.
     * `false` omits it. Defaults to a button named "Next slide", or "Scroll
     * forward" with `$kind="row"`.
     */
    nextButton?: CarouselButtonRender;
    /**
     * The `id` of the `CarouselSlide` at the start of the row, which the slide
     * tabs select. With several slides per view, the last slides all show at
     * the end of the row, where it's the slide that a slide tab or a button
     * picked, or the last slide. Setting it scrolls to that slide. Use it with
     * `setSelectedId` to follow the carousel from outside, such as to color
     * other parts after the slide that shows.
     */
    selectedId?: string;
    /**
     * The `id` of the `CarouselSlide` to show first, when `selectedId` is not
     * set. The carousel scrolls there at once when script runs, or, when it
     * mounts hidden, once it shows. Until script runs, server-rendered HTML
     * shows the first slide.
     */
    defaultSelectedId?: string;
    /**
     * Called with the `id` of the `CarouselSlide` at the start of the row,
     * after a scroll, a button, or a slide tab changes it.
     */
    setSelectedId?: (selectedId: string) => void;
  };

/**
 * Renders a horizontal carousel around a `CarouselViewport`. Without `$kind`,
 * it's a classic carousel of `CarouselSlide` elements: a region that screen
 * readers announce as a carousel, with buttons on every device and slide
 * position text. With `$kind="row"`, it adds no semantics, and its buttons show
 * only with a fine pointer, for chips, thumbnails, and cards that scroll
 * freely.
 * @example
 * <Carousel aria-label="Featured projects">
 *   <CarouselViewport>
 *     <CarouselSlide>Dashboard</CarouselSlide>
 *     <CarouselSlide>Mobile app</CarouselSlide>
 *   </CarouselViewport>
 *   <CarouselTabList>
 *     <CarouselTab />
 *     <CarouselTab />
 *   </CarouselTabList>
 * </Carousel>
 * @example
 * <Carousel $kind="row">
 *   <CarouselViewport aria-label="Filters" render={<div role="toolbar" />}>
 *     <Button>Recent</Button>
 *     <Button>Popular</Button>
 *   </CarouselViewport>
 * </Carousel>
 * @example
 * const [selectedId, setSelectedId] = useState("dashboard");
 * <Carousel
 *   aria-label="Featured projects"
 *   selectedId={selectedId}
 *   setSelectedId={setSelectedId}
 * >
 *   <CarouselViewport>
 *     <CarouselSlide id="dashboard">Dashboard</CarouselSlide>
 *     <CarouselSlide id="mobile-app">Mobile app</CarouselSlide>
 *   </CarouselViewport>
 * </Carousel>
 */
export function Carousel<
  R extends RecipeLike<typeof carousel, R> = typeof carousel,
>({
  recipe,
  buttons = true,
  previousButton = true,
  nextButton = true,
  selectedId,
  defaultSelectedId,
  setSelectedId,
  children,
  ...props
}: CarouselProps<R>) {
  const styles = recipe ?? carousel;
  const [variantProps, rest] = splitProps(props, styles);
  // The style recipe resolves the kind, including the default of an extender.
  const kind = styles.getVariants(variantProps).$kind ?? "slides";
  const collection = ak.useCollectionStore();
  const state = useCarousel({
    kind,
    collection,
    selectedId,
    defaultSelectedId,
    setSelectedId,
  });
  const slides = kind === "slides";
  const context: CarouselContextValue = {
    kind,
    showButtons: buttons,
    previousButton,
    nextButton,
    collection,
    state,
  };
  return (
    <CarouselContext.Provider value={context}>
      <ak.Role
        role={slides ? "region" : undefined}
        aria-roledescription={slides ? "carousel" : undefined}
        {...styles.jsx(variantProps)}
        {...rest}
      >
        {children}
        {slides && (
          <div className="sr-only" aria-live="polite" aria-atomic>
            {state.status}
          </div>
        )}
      </ak.Role>
    </CarouselContext.Provider>
  );
}

export type CarouselViewportProps<
  R extends RecipeLike<typeof carouselViewportBase, R> =
    typeof carouselViewport,
> = ak.RoleProps &
  VariantProps<R> & {
    /**
     * The style recipe applied in place of `carouselViewport`, such as one for
     * a tab strip. It must supply the `$fade` and `$step` variants. The kind of
     * the `Carousel` sets only the defaults of `carouselViewport`.
     */
    recipe?: R;
  };

/**
 * Renders the part of a `Carousel` that scrolls, with the previous and next
 * buttons before and after it. It takes the kind of its `Carousel`. Give a row
 * of plain content a name and a role, such as `toolbar` for a row of buttons.
 * @example
 * <Carousel $kind="row">
 *   <CarouselViewport aria-label="Filters" render={<div role="toolbar" />}>
 *     <Button>Recent</Button>
 *     <Button>Popular</Button>
 *   </CarouselViewport>
 * </Carousel>
 */
export function CarouselViewport<
  R extends RecipeLike<typeof carouselViewportBase, R> =
    typeof carouselViewport,
>({ recipe, ref, ...props }: CarouselViewportProps<R>) {
  const context = useCarouselContext("CarouselViewport");
  const styles = recipe ?? carouselViewport;
  const [variantProps, rest] = splitProps(props, styles);
  const defaultId = useId();
  const id = props.id ?? defaultId;
  const mergedRef = useMergeRefs(ref, context.state.setViewport);
  const slides = context.kind === "slides";
  const getButtonProps = (side: "start" | "end") =>
    getCarouselButtonProps({
      state: context.state,
      side,
      labels: slides ? SLIDE_LABELS : ROW_LABELS,
      controls: slides ? id : undefined,
    });
  const previous =
    context.showButtons &&
    createOptionalRender(
      CarouselButton,
      context.previousButton === true ? {} : context.previousButton,
      getButtonProps("start"),
    );
  const next =
    context.showButtons &&
    createOptionalRender(
      CarouselButton,
      context.nextButton === true ? {} : context.nextButton,
      getButtonProps("end"),
    );
  return (
    <>
      {previous}
      <ak.Role
        ref={mergedRef}
        {...(recipe
          ? styles.jsx(variantProps)
          : carouselViewport.jsx({ $kind: context.kind, ...variantProps }))}
        {...rest}
        id={id}
      />
      {next}
    </>
  );
}

export interface CarouselSlideProps
  extends ak.CollectionItemProps, VariantProps<typeof carouselSlide> {}

/**
 * Renders a slide in a `CarouselViewport`. In a classic carousel, screen
 * readers announce it as a slide named by its position, such as "2 of 5".
 * @example
 * <Carousel aria-label="Featured projects">
 *   <CarouselViewport>
 *     <CarouselSlide>Dashboard</CarouselSlide>
 *     <CarouselSlide>Mobile app</CarouselSlide>
 *   </CarouselViewport>
 * </Carousel>
 */
export function CarouselSlide(props: CarouselSlideProps) {
  const context = useCarouselContext("CarouselSlide");
  const [variantProps, rest] = splitProps(props, carouselSlide);
  const defaultId = useId();
  const id = rest.id ?? defaultId;
  const position = ak.useStoreState(context.collection, (state) => {
    const index = state.renderedItems.findIndex((item) => item.id === id);
    if (index < 0) return;
    return `${index + 1} of ${state.renderedItems.length}`;
  });
  const slides = context.kind === "slides";
  return (
    <ak.CollectionItem
      store={context.collection}
      role={slides ? "group" : undefined}
      aria-roledescription={slides ? "slide" : undefined}
      aria-label={slides ? position : undefined}
      {...carouselSlide.jsx(variantProps)}
      {...rest}
      id={id}
    />
  );
}

export interface CarouselTabListProps
  extends ak.TabListProps, VariantProps<typeof carouselTabList> {}

interface CarouselTabContextValue {
  id: string;
  index: number;
}

const CarouselTabContext = createContext<CarouselTabContextValue | null>(null);

function getTabId(baseId: string, index: number) {
  return `${baseId}-${index}`;
}

/**
 * Renders a tab list below the viewport, with a `CarouselTab` for each
 * `CarouselSlide`. Each tab picks the slide at its position, and the selected
 * tab follows the scroll position. Each child element is one tab. The tabs
 * render on the server, where the first one is selected.
 * @example
 * <Carousel aria-label="Featured projects">
 *   <CarouselViewport>
 *     {projects.map((project) => (
 *       <CarouselSlide key={project.id}>{project.title}</CarouselSlide>
 *     ))}
 *   </CarouselViewport>
 *   <CarouselTabList>
 *     {projects.map((project) => (
 *       <CarouselTab key={project.id} />
 *     ))}
 *   </CarouselTabList>
 * </Carousel>
 */
export function CarouselTabList({ children, ...props }: CarouselTabListProps) {
  const context = useCarouselContext("CarouselTabList");
  const [variantProps, rest] = splitProps(props, carouselTabList);
  const { state, collection } = context;
  const slides = ak.useStoreState(collection, "renderedItems");
  const defaultId = useId();
  const baseId = rest.id ?? defaultId;
  // Tabs and slides pair by position, so the tabs, and the selected one, can
  // render before any slide registers, such as on the server.
  const tabs = Children.toArray(children).filter(isValidElement);
  const selectedIndex = slides.findIndex(
    (slide) => slide.id === state.selectedId,
  );
  const selectedSlideId = state.selectedId ?? slides[0]?.id;

  const setSelectedId = (tabId?: string | null) => {
    const index = tabs.findIndex(
      (_, index) => getTabId(baseId, index) === tabId,
    );
    const slide = slides[index];
    if (!slide) return;
    if (slide.id === selectedSlideId) return;
    state.scrollToSlide(slide.id);
  };

  return (
    <ak.TabProvider
      selectedId={getTabId(baseId, Math.max(0, selectedIndex))}
      setSelectedId={setSelectedId}
      rtl={state.rtl}
    >
      <ak.TabList
        aria-label="Slides"
        {...carouselTabList.jsx(variantProps)}
        {...rest}
      >
        {tabs.map((tab, index) => (
          <CarouselTabContext.Provider
            key={tab.key ?? index}
            value={{ id: getTabId(baseId, index), index }}
          >
            {tab}
          </CarouselTabContext.Provider>
        ))}
      </ak.TabList>
    </ak.TabProvider>
  );
}

export interface CarouselTabProps
  extends Omit<ak.TabProps, "id">, VariantProps<typeof carouselTab> {}

/**
 * Renders a dot tab in a `CarouselTabList` that picks the slide at its
 * position, named by the position, such as "Slide 2".
 * @example
 * <CarouselTabList>
 *   <CarouselTab />
 *   <CarouselTab aria-label="Mobile app" />
 * </CarouselTabList>
 */
export function CarouselTab(props: CarouselTabProps) {
  const context = useCarouselContext("CarouselTab");
  const tab = useContext(CarouselTabContext);
  if (!tab) {
    throw new Error("CarouselTab must be rendered inside a CarouselTabList.");
  }
  const [variantProps, rest] = splitProps(props, carouselTab);
  const slideId = ak.useStoreState(
    context.collection,
    (state) => state.renderedItems[tab.index]?.id,
  );
  return (
    <ak.Tab
      aria-label={`Slide ${tab.index + 1}`}
      aria-controls={slideId}
      {...carouselTab.jsx(variantProps)}
      {...rest}
      id={tab.id}
    />
  );
}

// A carousel button stands alone at its end of the row, so it takes no bar and
// no separator.
export interface CarouselButtonProps extends Omit<
  ButtonProps<typeof carouselButton>,
  "recipe" | "bar" | "separator"
> {}

/**
 * Renders a round button that scrolls a carousel toward its side, in an area at
 * that end of the row. The button takes the pointer over the whole area.
 * `CarouselViewport` renders one on each side. Children replace the chevron,
 * and the button keeps the label of its side, so give text children an
 * `aria-label` with the same text.
 * @example
 * <Carousel previousButton={{ "aria-label": "Earlier filters" }}>
 *   <CarouselViewport>
 *     <CarouselSlide>Dashboard</CarouselSlide>
 *   </CarouselViewport>
 * </Carousel>
 */
export function CarouselButton({ children, ...props }: CarouselButtonProps) {
  const viewport = useContext(CarouselContext)?.state.viewport;
  const [area, setArea] = useState<HTMLDivElement | null>(null);
  useWheelScroll(area, viewport);
  const Icon = props.$side === "start" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <div ref={setArea} {...carouselButtonArea.jsx({ $side: props.$side })}>
      <Button recipe={carouselButton} {...props}>
        {children ?? <Icon />}
      </Button>
    </div>
  );
}
