import * as ak from "@ariakit/react";
import { useEvent, useMergeRefs } from "@ariakit/react-utils";
import { contains, getActiveElement, getWindow, isNode } from "@ariakit/utils";
import type { RecipeLike, VariantProps, VariantPropsWithRecipe } from "clava";
import { splitProps } from "clava";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";
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
  useSyncExternalStore,
} from "react";
import type * as React from "react";
import { createOptionalRender } from "../react-utils/create-render.react.ts";
import {
  carousel,
  carouselButton,
  carouselButtonArea,
  carouselPlayButton,
  carouselPlayButtonArea,
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

// How long autoplay shows each slide by default, in milliseconds.
const AUTO_PLAY_DELAY = 5000;

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

/**
 * The slides that show more than half of their width in the viewport, at the
 * scroll position, or at `offset` once the viewport scrolls there.
 */
function getShownSlides(
  viewport: HTMLElement,
  slides: SlideItem[],
  offset = getOffset(viewport),
) {
  const viewportRect = viewport.getBoundingClientRect();
  // A larger offset moves the slides toward the start of the row, which is the
  // left in a left-to-right row.
  const shift = (offset - getOffset(viewport)) * (isRtl(viewport) ? -1 : 1);
  return slides.filter((slide) => {
    const rect = slide.element.getBoundingClientRect();
    const visible =
      Math.min(rect.right - shift, viewportRect.right) -
      Math.max(rect.left - shift, viewportRect.left);
    return visible > rect.width / 2;
  });
}

/** The text that tells screen readers which slides show. */
function getSlideStatus(viewport: HTMLElement, slides: SlideItem[]) {
  const shown = getShownSlides(viewport, slides);
  const first = shown[0];
  const last = shown.at(-1);
  if (!first || !last) return "";
  const firstPosition = slides.indexOf(first) + 1;
  const lastPosition = slides.indexOf(last) + 1;
  if (first === last) {
    return `Showing slide ${firstPosition} of ${slides.length}`;
  }
  return `Showing slides ${firstPosition} to ${lastPosition} of ${slides.length}`;
}

/** Where the viewport scrolls to show a slide at the start of the row. */
function getSlideScrollOffset(viewport: HTMLElement, slide: SlideItem) {
  const padding = getScrollPadding(viewport);
  const offset = getStartOffset(viewport, slide.element) - padding.start;
  return Math.min(Math.max(0, offset), getMaxOffset(viewport));
}

interface GetAdjacentSlideParams {
  viewport: HTMLElement;
  slides: SlideItem[];
  side: CarouselSide;
  /**
   * The slide to step from, such as the one that a running scroll goes to.
   * Without it, the step starts at the scroll position.
   */
  fromId?: string;
}

/**
 * The slide that one step toward `side` scrolls to. Slides scroll to the
 * position of a slide, because WebKit ignores mandatory snapping for a smooth
 * scroll by a distance. The step starts at the position of `fromId`, or at the
 * scroll position, and skips the slides that scroll to the same place, such as
 * the last slides when several show at the end of the row.
 */
function getAdjacentSlide({
  viewport,
  slides,
  side,
  fromId,
}: GetAdjacentSlideParams) {
  const padding = getScrollPadding(viewport);
  const max = getMaxOffset(viewport);
  const getSlideOffset = (slide: SlideItem) => {
    const offset = getStartOffset(viewport, slide.element) - padding.start;
    return Math.min(Math.max(0, offset), max);
  };
  const fromSlide = slides.find((slide) => slide.id === fromId);
  const from = fromSlide ? getSlideOffset(fromSlide) : getOffset(viewport);
  if (side === "end") {
    return slides.find((slide) => getSlideOffset(slide) > from + END_TOLERANCE);
  }
  return slides.findLast(
    (slide) => getSlideOffset(slide) < from - END_TOLERANCE,
  );
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

/**
 * The slide that autoplay moves to, and the slides that show once it's there.
 */
interface AutoPlayTarget {
  id: string;
  shownIds: string[];
}

const NO_IDS: string[] = [];

function isSameList(a: readonly string[], b: readonly string[]) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
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
  /**
   * Keeps the ids of the slides that show now in `visibleIds`, which autoplay
   * reads.
   */
  trackVisible?: boolean;
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
  trackVisible = false,
}: UseCarouselParams) {
  const [viewport, setViewport] = useState<HTMLElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [internalSelectedId, setInternalSelectedId] =
    useState(defaultSelectedId);
  const selectedId = selectedIdProp ?? internalSelectedId;
  const [status, setStatus] = useState("");
  // The slides that show more than half of their width now.
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  // The slides that showed at some point, or that a move or autoplay goes to,
  // which render the content of a lazy slide from then on.
  const [shownIds, setShownIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
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

  const showSlides = useCallback((ids: string[]) => {
    setShownIds((shownIds) => {
      if (ids.every((id) => shownIds.has(id))) return shownIds;
      return new Set([...shownIds, ...ids]);
    });
  }, []);

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
      // no box to measure, so the carousel keeps its state until it shows. It
      // shows no slides meanwhile, so autoplay doesn't count its delay.
      if (!viewport.clientWidth) {
        if (trackVisible) setVisibleIds(NO_IDS);
        return;
      }
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
      const shown = getShownSlides(viewport, slides).map((slide) => slide.id);
      if (trackVisible) {
        setVisibleIds((visibleIds) =>
          isSameList(visibleIds, shown) ? visibleIds : shown,
        );
      }
      // A scroll to a target, such as a slide tab or autoplay, passes slides on
      // the way, which don't render their lazy content.
      if (!targetRef.current) {
        showSlides(shown);
      }
      if (!nextAtEnd && !targetRef.current) {
        pickedIdRef.current = undefined;
      }
      const current = getCurrentSlide(viewport, slides, pickedIdRef.current);
      const target = targetRef.current;
      const targetSlide = slides.find((slide) => slide.id === target);
      // A smooth scroll passes the slides before its target, and the target is
      // not the closest slide until the scroll gets near it, so the target
      // holds until the scroll reaches its position.
      const reached =
        !!targetSlide &&
        Math.abs(getSlideScrollOffset(viewport, targetSlide) - offset) <=
          END_TOLERANCE;
      if (target && (reached || !targetSlide)) {
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
    // only focus that matches :focus-visible scrolls. A viewport that snaps
    // would snap a scroll to the element back to where it was, so it scrolls
    // the item that holds the element, which can snap. An item that doesn't fit
    // would go to the middle of the row, with an element at its edge under a
    // fade, so the element scrolls instead. A text field that a press focuses
    // matches :focus-visible too, so the carousel also skips the focus that a
    // press moves. A tap sends its mousedown after the pointer lifts, before
    // the focus.
    let pressing = false;
    let pressTimer = 0;
    // The browser moves focus right after the mousedown, before a timer can
    // run. A drag or a context menu can end the press without a mouseup, so a
    // timer ends it instead.
    const onMouseDown = () => {
      pressing = true;
      clearTimeout(pressTimer);
      pressTimer = window.setTimeout(() => {
        pressing = false;
      });
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
      clearTimeout(pressTimer);
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("focusin", onFocusIn);
      viewport.removeEventListener("mousedown", onMouseDown, true);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      attributeObserver.disconnect();
      updateRef.current = undefined;
    };
  }, [
    viewport,
    kind,
    renderedItems,
    trackVisible,
    onSelectedIdChange,
    showSlides,
  ]);

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
      const offset = getSlideScrollOffset(viewport, slide);
      // The slides at the target render their lazy content as the scroll
      // starts, so they don't show empty when it ends.
      const slides = getSlideItems(renderedItems);
      showSlides(getShownSlides(viewport, slides, offset).map(({ id }) => id));
      scrollToOffset(viewport, offset, instant);
      updateRef.current?.();
      return true;
    },
    [viewport, renderedItems, showSlides],
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
      const next = getAdjacentSlide({
        viewport,
        slides: getSlideItems(renderedItems),
        side,
        fromId: targetRef.current,
      });
      if (!next) return;
      scrollToSlide(next.id);
    },
    [viewport, kind, renderedItems, scrollToSlide],
  );

  // The next slide, or the first one after the last, with the slides that show
  // once the viewport is there. A row that doesn't overflow, or a single slide
  // at the start of the row, has nowhere to go.
  const getAutoPlayTarget = useCallback((): AutoPlayTarget | undefined => {
    if (!viewport?.clientWidth) return;
    const slides = getSlideItems(renderedItems);
    const target =
      getAdjacentSlide({
        viewport,
        slides,
        side: "end",
        // Autoplay steps from the selected slide, not from the scroll position,
        // so each move selects another slide, which starts the delay again. A
        // scroll without snapping can stop just before the slide that it
        // selects, where a step from the scroll position only aligns that
        // slide.
        fromId: targetRef.current ?? reportedIdRef.current,
      }) ?? slides[0];
    if (!target) return;
    const offset = getSlideScrollOffset(viewport, target);
    if (Math.abs(offset - getOffset(viewport)) <= END_TOLERANCE) return;
    const shown = getShownSlides(viewport, slides, offset);
    return { id: target.id, shownIds: shown.map((slide) => slide.id) };
  }, [viewport, renderedItems]);

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
    visibleIds,
    shownIds,
    showSlides,
    goToSlide,
    getAutoPlayTarget,
    scrollToward,
    scrollToSlide,
  };
}

type CarouselState = ReturnType<typeof useCarousel>;

/**
 * Holds the slides whose `ready` prop is `false`. Autoplay subscribes to it
 * while it waits for the next slides, so a change doesn't restart its delay.
 */
function createSlideReadiness() {
  const notReadyIds = new Set<string>();
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) {
      listener();
    }
  };
  return {
    /** Marks a slide as not ready, until the returned function runs. */
    markNotReady: (id: string) => {
      notReadyIds.add(id);
      emit();
      return () => {
        notReadyIds.delete(id);
        emit();
      };
    },
    areReady: (ids: string[]) => ids.every((id) => !notReadyIds.has(id)),
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

type SlideReadiness = ReturnType<typeof createSlideReadiness>;

function noop() {}

/** Whether the window of `element` matches a media query. */
function useMediaQuery(element: HTMLElement | null, query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!element) return noop;
      const media = getWindow(element).matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [element, query],
  );
  return useSyncExternalStore(
    subscribe,
    () => !!element && getWindow(element).matchMedia(query).matches,
    () => false,
  );
}

/** Whether the document of `element` is hidden, such as in a background tab. */
function usePageHidden(element: HTMLElement | null) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!element) return noop;
      const doc = element.ownerDocument;
      doc.addEventListener("visibilitychange", onChange);
      return () => doc.removeEventListener("visibilitychange", onChange);
    },
    [element],
  );
  return useSyncExternalStore(
    subscribe,
    () => element?.ownerDocument.visibilityState === "hidden",
    () => false,
  );
}

/**
 * Tracks whether the person interacts with a carousel, with the pointer over
 * it, focus inside it, or a finger on it, which pauses autoplay. A start from
 * the play button ignores the pause until that interaction ends.
 */
function useCarouselPause(element: HTMLElement | null) {
  const [interacting, setInteracting] = useState(false);
  const [ignored, setIgnored] = useState(false);
  // A click on the play button can come before the render of the hover that the
  // same pointer move started, so ignore() reads the events, not the state.
  const interactingRef = useRef(false);

  useEffect(() => {
    if (!element) return;
    // The element can be in another document, such as an iframe.
    const doc = element.ownerDocument;
    const win = getWindow(element);
    let focusTimer = 0;
    let isHovered = false;
    let isFocused = false;
    let isTouched = false;
    const update = () => {
      const next = isHovered || isFocused || isTouched;
      interactingRef.current = next;
      setInteracting(next);
      if (next) return;
      // Once the interaction ends, the next one pauses autoplay again.
      setIgnored(false);
    };
    // The pointer or focus can already be on the carousel, or can have left it
    // while autoplay was off, so the state starts from the page.
    const startTimer = window.setTimeout(() => {
      isHovered = element.matches(":hover");
      isFocused = element.contains(getActiveElement(element, { frame: false }));
      setIgnored(false);
      update();
    });
    // Focus that moves into an iframe in the carousel leaves the document
    // first, and the iframe becomes the active element only when the window
    // blurs. Focus that leaves such an iframe fires nothing on the carousel. So
    // the check runs once the events of a move end. Focus that moves between
    // two iframes fires nothing on the page at all.
    const checkFocus = () => {
      clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => {
        const activeElement = getActiveElement(element, { frame: false });
        isFocused = element.contains(activeElement);
        update();
      });
    };
    const onPointerEnter = () => {
      isHovered = true;
      update();
    };
    const onPointerLeave = () => {
      isHovered = false;
      update();
    };
    // A touch that pans the row ends its pointer at once, with pointercancel
    // and pointerleave, while the finger stays on the row. Touch events go on
    // until the finger lifts.
    const onTouchStart = () => {
      isTouched = true;
      update();
    };
    // The touches of an event include fingers anywhere on the screen, so only
    // the ones that started in the carousel keep the pause.
    const onTouchEnd = (event: TouchEvent) => {
      isTouched = Array.from(event.touches).some(
        ({ target }) => isNode(target) && contains(element, target),
      );
      update();
    };
    element.addEventListener("pointerenter", onPointerEnter);
    element.addEventListener("pointerleave", onPointerLeave);
    element.addEventListener("touchstart", onTouchStart, { passive: true });
    element.addEventListener("touchend", onTouchEnd);
    element.addEventListener("touchcancel", onTouchEnd);
    element.addEventListener("focusout", checkFocus);
    doc.addEventListener("focusin", checkFocus);
    win.addEventListener("focus", checkFocus);
    win.addEventListener("blur", checkFocus);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(focusTimer);
      element.removeEventListener("pointerenter", onPointerEnter);
      element.removeEventListener("pointerleave", onPointerLeave);
      element.removeEventListener("touchstart", onTouchStart);
      element.removeEventListener("touchend", onTouchEnd);
      element.removeEventListener("touchcancel", onTouchEnd);
      element.removeEventListener("focusout", checkFocus);
      doc.removeEventListener("focusin", checkFocus);
      win.removeEventListener("focus", checkFocus);
      win.removeEventListener("blur", checkFocus);
    };
  }, [element]);

  const ignore = useCallback(() => {
    if (!interactingRef.current) return;
    setIgnored(true);
  }, []);

  return { paused: interacting && !ignored, ignore };
}

type CarouselPause = ReturnType<typeof useCarouselPause>;

interface UseCarouselAutoPlayParams {
  /** Whether autoplay is on, which only a classic carousel supports. */
  enabled: boolean;
  /** How long each slide shows, in milliseconds. */
  delay: number;
  root: HTMLElement | null;
  state: CarouselState;
  readiness: SlideReadiness;
  pause: CarouselPause;
  /**
   * What the person chose with the play button, or with a press of the previous
   * or next button or a slide tab. Until they choose, autoplay plays unless
   * reduced motion is on.
   */
  choice?: boolean;
  setChoice: (choice: boolean) => void;
}

/**
 * Moves a classic carousel to the next slide after a delay, and from the last
 * slide back to the first. It plays until the person stops it, with the play
 * button, or with a press of the previous or next button or a slide tab. It
 * pauses by itself while the pointer is over the carousel, while focus is
 * inside it, while a finger touches it outside a slide iframe, while the page
 * or the carousel is hidden, and while the slides that show or the next ones
 * aren't ready.
 */
function useCarouselAutoPlay({
  enabled,
  delay,
  root,
  state,
  readiness,
  pause,
  choice,
  setChoice,
}: UseCarouselAutoPlayParams) {
  // Carousels without autoplay, such as the rows in tabs, don't subscribe.
  const element = enabled ? root : null;
  const reducedMotion = useMediaQuery(
    element,
    "(prefers-reduced-motion: reduce)",
  );
  const hidden = usePageHidden(element);
  const playing = enabled && (choice ?? !reducedMotion);
  const { selectedId, visibleIds, showSlides, goToSlide, getAutoPlayTarget } =
    state;

  // The delay counts only while every slide that shows is ready, so each slide
  // shows ready for the whole delay. A hidden viewport shows no slides.
  const visibleReady = useSyncExternalStore(
    readiness.subscribe,
    () => visibleIds.length > 0 && readiness.areReady(visibleIds),
    () => false,
  );
  // A row whose slides all fit has no slide to move to, so, as in a hidden
  // viewport, the delay doesn't count until the row overflows.
  const fits = state.atStart && state.atEnd;
  const running = playing && !pause.paused && !hidden && visibleReady && !fits;

  // When the delay ends, the slides at the next position render their lazy
  // content, and autoplay moves once they are ready. A pause, a row that starts
  // to overflow, or other slides that show, such as after a move, start the
  // delay again from the beginning and drop a move that waits.
  useEffect(() => {
    if (!running) return;
    let unsubscribe = noop;
    const timer = window.setTimeout(() => {
      const target = getAutoPlayTarget();
      if (!target) return;
      showSlides(target.shownIds);
      const move = () => {
        if (!readiness.areReady(target.shownIds)) return;
        unsubscribe();
        goToSlide(target.id);
      };
      unsubscribe = readiness.subscribe(move);
      move();
    }, delay);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [
    running,
    delay,
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- other slides that show restart the delay
    visibleIds,
    // Another selection, such as from `selectedId`, restarts the delay.
    selectedId,
    readiness,
    getAutoPlayTarget,
    showSlides,
    goToSlide,
  ]);

  const { ignore: ignorePause } = pause;
  const stop = useCallback(() => {
    // A move while autoplay is off isn't a choice about autoplay.
    if (!enabled) return;
    setChoice(false);
  }, [enabled, setChoice]);
  const toggle = useCallback(() => {
    if (playing) {
      setChoice(false);
      return;
    }
    setChoice(true);
    // The person asked autoplay to play, so it plays at once, even with the
    // pointer or focus still on the carousel.
    ignorePause();
  }, [playing, setChoice, ignorePause]);

  return { enabled, playing, stop, toggle };
}

type CarouselAutoPlay = ReturnType<typeof useCarouselAutoPlay>;

interface CarouselButtonLabels {
  start: string;
  end: string;
}

interface GetCarouselButtonPropsParams {
  state: Pick<CarouselState, "atStart" | "atEnd" | "scrollToward">;
  autoPlay: Pick<CarouselAutoPlay, "stop">;
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
  autoPlay,
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
    onClick: () => {
      // A press stops autoplay until the person starts it again.
      autoPlay.stop();
      state.scrollToward(side);
    },
  };
}

/**
 * Returns the default props of the play button, which stops and starts
 * autoplay. A pointer press keeps focus where it was, as on the previous and
 * next buttons, so a press that starts autoplay doesn't pause it with focus.
 */
function getCarouselPlayButtonProps(autoPlay: CarouselAutoPlay) {
  return {
    "aria-label": autoPlay.playing
      ? "Stop automatic slide show"
      : "Start automatic slide show",
    onMouseDown: (event: React.MouseEvent) => event.preventDefault(),
    onClick: autoPlay.toggle,
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

/** The play button, as `true`, an element, or props. */
export type CarouselPlayButtonRender =
  | boolean
  | React.ReactElement
  | CarouselPlayButtonProps;

interface CarouselContextValue {
  kind: CarouselKind;
  showButtons: boolean;
  previousButton: CarouselButtonRender;
  nextButton: CarouselButtonRender;
  playButton: CarouselPlayButtonRender;
  collection: ak.CollectionStore;
  state: CarouselState;
  autoPlay: CarouselAutoPlay;
  readiness: SlideReadiness;
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
    /**
     * Moves to the next slide by itself after `autoPlayDelay`, and from the
     * last slide back to the first. When the delay ends, the slides at the next
     * position render their `lazy` content, and autoplay waits until they are
     * `ready` before it moves.
     *
     * It pauses while the pointer is over the carousel, while focus is inside
     * it, while a finger touches it, and while the page is hidden, and the
     * delay starts again when the pause ends. A finger on a slide iframe
     * doesn't pause it, because the iframe keeps its touch events, and focus
     * that moves straight between a slide iframe and another iframe changes the
     * pause only once focus comes back to the page. A scroll by the person,
     * such as a swipe, only moves the slides, and autoplay goes on from there.
     * A press of the previous or next button or a slide tab stops it until the
     * person starts it again with the `playButton`, which plays at once, even
     * with the pointer or focus still on the carousel. With reduced motion, it
     * doesn't start until they do. While it plays without a pause, screen
     * readers don't announce the slide position. Only a classic carousel plays,
     * not `$kind="row"`.
     */
    autoPlay?: boolean;
    /**
     * The time, in milliseconds, that autoplay shows each slide. It counts only
     * while autoplay plays without a pause and the slides that show are
     * `ready`. Defaults to `5000`.
     */
    autoPlayDelay?: number;
    /**
     * The button that stops and starts autoplay, as `true`, an element, or
     * `CarouselPlayButton` props. `false` omits it, so give the person another
     * way to stop autoplay. It renders with `autoPlay` only, first in the Tab
     * order, and its name changes between "Stop automatic slide show" and
     * "Start automatic slide show". It sits at the top start corner of the
     * slides, above the previous button, so the row needs room for both: about
     * four button sizes. In a shorter row, it covers part of the previous
     * button. Defaults to `true`.
     */
    playButton?: CarouselPlayButtonRender;
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
  ref,
  buttons = true,
  previousButton = true,
  nextButton = true,
  playButton = true,
  selectedId,
  defaultSelectedId,
  setSelectedId,
  autoPlay = false,
  autoPlayDelay = AUTO_PLAY_DELAY,
  children,
  ...props
}: CarouselProps<R>) {
  const styles = recipe ?? carousel;
  const [variantProps, rest] = splitProps(props, styles);
  // The style recipe resolves the kind, including the default of an extender.
  const kind = styles.getVariants(variantProps).$kind ?? "slides";
  const slides = kind === "slides";
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const mergedRef = useMergeRefs(ref, setRoot);
  const [readiness] = useState(createSlideReadiness);
  const autoPlayEnabled = slides && autoPlay;
  const [autoPlayChoice, setAutoPlayChoice] = useState<boolean>();
  const pause = useCarouselPause(autoPlayEnabled ? root : null);
  const collection = ak.useCollectionStore();
  const state = useCarousel({
    kind,
    collection,
    selectedId,
    defaultSelectedId,
    setSelectedId,
    trackVisible: autoPlayEnabled,
  });
  const autoPlayState = useCarouselAutoPlay({
    enabled: autoPlayEnabled,
    delay: autoPlayDelay,
    root,
    state,
    readiness,
    pause,
    choice: autoPlayChoice,
    setChoice: setAutoPlayChoice,
  });
  const context: CarouselContextValue = {
    kind,
    showButtons: buttons,
    previousButton,
    nextButton,
    playButton,
    collection,
    state,
    autoPlay: autoPlayState,
    readiness,
  };
  return (
    <CarouselContext.Provider value={context}>
      <ak.Role
        ref={mergedRef}
        role={slides ? "region" : undefined}
        aria-roledescription={slides ? "carousel" : undefined}
        {...styles.jsx(variantProps)}
        {...rest}
      >
        {children}
        {slides && (
          <div
            className="sr-only"
            // Slides that move by themselves would interrupt screen readers
            // every few seconds, so the position text speaks only while
            // autoplay doesn't play, or while a pause holds it, when only the
            // person moves the slides, as in the APG example.
            aria-live={
              autoPlayState.playing && !pause.paused ? "off" : "polite"
            }
            aria-atomic
          >
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
 * buttons before and after it, and the play button of autoplay before them. It
 * takes the kind of its `Carousel`. Give a row of plain content a name and a
 * role, such as `toolbar` for a row of buttons.
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
      autoPlay: context.autoPlay,
      side,
      labels: slides ? SLIDE_LABELS : ROW_LABELS,
      controls: slides ? id : undefined,
    });
  // The play button comes first in the Tab order, so people reach it before the
  // slides that move.
  const play =
    context.autoPlay.enabled &&
    createOptionalRender(
      CarouselPlayButton,
      context.playButton === true ? {} : context.playButton,
      getCarouselPlayButtonProps(context.autoPlay),
    );
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
      {play}
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
  extends ak.CollectionItemProps, VariantProps<typeof carouselSlide> {
  /**
   * Whether the content of the slide is ready to show, such as an image or a
   * preview that has loaded. Autoplay moves only to ready slides, and waits for
   * the next ones to get ready, however long that takes. Its delay counts only
   * while the slides that show are ready. Set it to `false` before the content
   * starts to load, including while a `lazy` slide doesn't render it yet.
   * Defaults to `true`.
   */
  ready?: boolean;
  /**
   * Renders the children only once the slide shows, or once autoplay asks for
   * it at the end of its delay, and keeps them from then on. A slide that a
   * scroll to another slide passes on the way doesn't render them. The server
   * and the first render show the slide without its children. Only a classic
   * carousel renders lazily: in a `$kind="row"` carousel, the children render
   * at once. Defaults to `false`.
   */
  lazy?: boolean;
}

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
 * @example
 * <Carousel autoPlay aria-label="Examples">
 *   <CarouselViewport>
 *     {examples.map((example) => (
 *       <CarouselSlide
 *         key={example.id}
 *         lazy
 *         ready={loadedIds.has(example.id)}
 *       >
 *         <Preview example={example} onLoad={() => markLoaded(example.id)} />
 *       </CarouselSlide>
 *     ))}
 *   </CarouselViewport>
 * </Carousel>
 */
export function CarouselSlide({
  ready = true,
  lazy = false,
  children,
  ...props
}: CarouselSlideProps) {
  const context = useCarouselContext("CarouselSlide");
  const [variantProps, rest] = splitProps(props, carouselSlide);
  const defaultId = useId();
  const id = rest.id ?? defaultId;
  const { readiness } = context;
  useEffect(() => {
    if (ready) return;
    return readiness.markNotReady(id);
  }, [ready, id, readiness]);
  const slides = context.kind === "slides";
  // A row doesn't track the slides that show, so its slides render their
  // children at once.
  const rendered = !lazy || !slides || context.state.shownIds.has(id);
  const position = ak.useStoreState(context.collection, (state) => {
    const index = state.renderedItems.findIndex((item) => item.id === id);
    if (index < 0) return;
    return `${index + 1} of ${state.renderedItems.length}`;
  });
  return (
    <ak.CollectionItem
      store={context.collection}
      role={slides ? "group" : undefined}
      aria-roledescription={slides ? "slide" : undefined}
      aria-label={slides ? position : undefined}
      {...carouselSlide.jsx(variantProps)}
      {...rest}
      id={id}
    >
      {rendered && children}
    </ak.CollectionItem>
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
    // A pick stops autoplay until the person starts it again.
    context.autoPlay.stop();
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
  const [variantProps, { onClick, ...rest }] = splitProps(props, carouselTab);
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
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        // A press stops autoplay until the person starts it again, also on the
        // tab of the slide that shows, which doesn't change the selection.
        context.autoPlay.stop();
      }}
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

export interface CarouselPlayButtonProps extends Omit<
  ButtonProps<typeof carouselPlayButton>,
  "recipe" | "bar" | "separator"
> {}

/**
 * Renders a round button that stops and starts the autoplay of a carousel, in
 * an area at the top start corner of the row. `CarouselViewport` renders one
 * with `autoPlay` and gives it its name and its action. It shows a pause icon
 * while autoplay plays and a play icon while it doesn't. Children replace the
 * icon.
 * @example
 * <Carousel autoPlay playButton={{ $layer: "brand" }} aria-label="Examples">
 *   <CarouselViewport>
 *     <CarouselSlide>Dashboard</CarouselSlide>
 *   </CarouselViewport>
 * </Carousel>
 */
export function CarouselPlayButton({
  children,
  ...props
}: CarouselPlayButtonProps) {
  const context = useContext(CarouselContext);
  const playing = context?.autoPlay.playing;
  // The button lies over the slides, outside the viewport, where a wheel would
  // scroll the page.
  const [area, setArea] = useState<HTMLDivElement | null>(null);
  useWheelScroll(area, context?.state.viewport);
  const Icon = playing ? PauseIcon : PlayIcon;
  return (
    <div ref={setArea} {...carouselPlayButtonArea.jsx()}>
      <Button recipe={carouselPlayButton} {...props}>
        {children ?? <Icon fill="currentColor" />}
      </Button>
    </div>
  );
}
