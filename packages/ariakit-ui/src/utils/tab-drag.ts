import { getWindow } from "@ariakit/utils";
import { getClearRange } from "./carousel-clear.ts";
import {
  followSelectedTab,
  getCancelStatus,
  getMoveStatus,
  getStripTabs,
  isFixedTab,
  moveItem,
  prefersReducedMotion,
  slideTabs,
  updateSelectedTabFollow,
} from "./tab-reorder.ts";
import type { TabReorderParams } from "./tab-reorder.ts";

// How far a mouse or a pen moves along the strip before a press is a drag.
// Chrome starts the drag of a browser tab at the same distance.
const DRAG_DISTANCE = 10;
// How long a finger rests on a tab before it picks the tab up, in milliseconds.
// A finger that moves first scrolls the strip or the page.
const TOUCH_HOLD_TIME = 300;
// How far a finger can move while it rests.
const TOUCH_HOLD_DISTANCE = 8;
// The strip scrolls while the pointer is this near to an end of its clear
// range, faster toward the end, up to this many pixels each millisecond.
const SCROLL_EDGE = 48;
const SCROLL_SPEED = 0.7;
// How the other tabs slide out of the way of the tab under the pointer.
const SHIFT_TRANSITION = "translate 200ms cubic-bezier(0.3, 0, 0, 1)";

export interface TabDragParams extends TabReorderParams {
  /** Called when a press on a tab turns into a drag. */
  onDragStart?: (tab: HTMLElement) => void;
}

interface Press {
  pointerId: number;
  tab: HTMLElement;
  touch: boolean;
  x: number;
  y: number;
  timer: number;
}

interface InlineStyle {
  translate: string;
  transition: string;
  scale: string;
}

interface Drag {
  pointerId: number;
  tab: HTMLElement;
  touch: boolean;
  /** The tabs in the order of the page, and the index of the dragged tab. */
  tabs: HTMLElement[];
  from: number;
  /** The index that the tab takes if it drops now. */
  to: number;
  /** Where each tab starts along the strip at rest, and how wide it is. */
  starts: number[];
  sizes: number[];
  /** The room after each tab, which holds the gap and a separator. */
  gaps: number[];
  /** The separator before each tab, which stays between the same places. */
  separators: Array<HTMLElement | null>;
  /** The pointer along the strip when the drag started, and now. */
  origin: number;
  pointerX: number;
  time: number;
  frame: number;
  styles: Map<HTMLElement, InlineStyle>;
  /** The separators that hide beside the place of the dragged tab. */
  shy: Element[];
  release: () => void;
}

/**
 * Lets people drag the tabs of a strip to a new place, with a mouse, a pen, or
 * a long press of a finger. The tab follows the pointer along the strip, the
 * other tabs make room, and the strip scrolls near its ends. The order of the
 * tabs in the page doesn't change during the drag: the drop calls `onReorder`
 * once when the tab has a new place, and the Escape key puts the tab back.
 * Returns a function that stops this.
 */
export function observeTabDrag(params: TabDragParams) {
  const { strip, onReorder, announce, onDragStart } = params;
  const win = getWindow(strip);
  const doc = strip.ownerDocument;
  let press: Press | null = null;
  let drag: Drag | null = null;

  // Positions run along the strip from its start, with the scroll, so they grow
  // with the index of a tab in both text directions.
  const isRtl = () => win.getComputedStyle(strip).direction === "rtl";
  const getPosition = (clientX: number, rtl: boolean) => {
    const offset = clientX - strip.getBoundingClientRect().left;
    const position = offset + strip.scrollLeft;
    return rtl ? -position : position;
  };
  const getStart = (element: HTMLElement, rtl: boolean) => {
    const rect = element.getBoundingClientRect();
    return getPosition(rtl ? rect.right : rect.left, rtl);
  };

  const removePointerListeners = () => {
    win.removeEventListener("pointermove", onPointerMove);
    win.removeEventListener("pointerup", onPointerUp);
    win.removeEventListener("pointercancel", onPointerCancel);
  };

  const endPress = () => {
    if (!press) return;
    win.clearTimeout(press.timer);
    press = null;
  };

  // Where the tabs start when the dragged tab sits at an index. The room after
  // each place stays, because a separator belongs to its place and not to a
  // tab.
  const getStarts = (current: Drag, to: number) => {
    const order = moveItem(current.tabs, current.from, to);
    const starts = new Map<HTMLElement, number>();
    let start = current.starts[0] ?? 0;
    order.forEach((tab, index) => {
      starts.set(tab, start);
      const size = current.sizes[current.tabs.indexOf(tab)] ?? 0;
      start += size + (current.gaps[index] ?? 0);
    });
    return { order, starts };
  };

  const setShift = (element: HTMLElement, distance: number, rtl: boolean) => {
    const value = `${rtl ? -distance : distance}px 0`;
    if (element.style.translate === value) return;
    element.style.translate = value;
  };

  // Moves the other tabs, and the separators between the places, to where they
  // are when the dragged tab sits at an index.
  const shiftTabs = (current: Drag, to: number, rtl: boolean) => {
    const { order, starts } = getStarts(current, to);
    current.tabs.forEach((tab, index) => {
      const separator = current.separators[index];
      const occupant = order[index];
      const rest = current.starts[index] ?? 0;
      if (separator && occupant) {
        setShift(separator, (starts.get(occupant) ?? rest) - rest, rtl);
      }
      if (tab === current.tab) return;
      setShift(tab, (starts.get(tab) ?? rest) - rest, rtl);
    });
  };

  // The separator of the control after the strip, such as a button of a tab
  // row, which follows the last tab.
  const getSeparatorAfterStrip = () => {
    let next = strip.nextElementSibling;
    if (next?.classList.contains("carousel-button-area")) {
      next = next.nextElementSibling;
    }
    return next?.classList.contains("control-separator") ? next : null;
  };

  // A separator hides beside the selected tab. The style rules find that tab
  // from the order in the page, where the dragged tab keeps its place, so
  // during the drag the separators on each side of the place that the tab takes
  // get data-shy instead.
  const markSeparators = (current: Drag, to: number) => {
    const before = current.separators[to] ?? null;
    const after =
      to === current.tabs.length - 1
        ? getSeparatorAfterStrip()
        : (current.separators[to + 1] ?? null);
    const shy = [before, after].filter((element) => element != null);
    for (const element of current.shy) {
      if (shy.includes(element)) continue;
      element.removeAttribute("data-shy");
    }
    for (const element of shy) {
      element.setAttribute("data-shy", "");
    }
    current.shy = shy;
  };

  // Scrolls the strip while the pointer rests near an end of its clear range.
  const scrollNearEnd = (current: Drag, elapsed: number) => {
    const clear = getClearRange(strip);
    const before = clear.left + SCROLL_EDGE - current.pointerX;
    const after = current.pointerX - (clear.right - SCROLL_EDGE);
    const depth = Math.max(before, after);
    if (depth <= 0) return;
    const speed = Math.min(1, depth / SCROLL_EDGE) * SCROLL_SPEED;
    const distance = speed * elapsed * (before > after ? -1 : 1);
    strip.scrollTo({ left: strip.scrollLeft + distance, behavior: "instant" });
  };

  // Puts the dragged tab under the pointer, and the other tabs around the place
  // that it takes.
  const place = (current: Drag) => {
    const rtl = isRtl();
    const rest = current.starts[current.from] ?? 0;
    const size = current.sizes[current.from] ?? 0;
    const first = current.starts[0] ?? 0;
    const lastIndex = current.tabs.length - 1;
    const end =
      (current.starts[lastIndex] ?? 0) + (current.sizes[lastIndex] ?? 0);
    // The tab stays between the first and the last place of the strip.
    const wanted = rest + getPosition(current.pointerX, rtl) - current.origin;
    const start = Math.max(first, Math.min(end - size, wanted));
    setShift(current.tab, start - rest, rtl);
    // The tab takes the place whose start is nearest to its own.
    let to = current.to;
    let nearest = Number.POSITIVE_INFINITY;
    for (let index = 0; index <= lastIndex; index++) {
      const place = getStarts(current, index).starts.get(current.tab) ?? 0;
      const distance = Math.abs(place - start);
      if (distance >= nearest) continue;
      nearest = distance;
      to = index;
    }
    if (to === current.to) return;
    current.to = to;
    shiftTabs(current, to, rtl);
    markSeparators(current, to);
  };

  const step = (time: number) => {
    const current = drag;
    if (!current) return;
    current.frame = win.requestAnimationFrame(step);
    scrollNearEnd(current, Math.min(50, time - current.time));
    current.time = time;
    place(current);
    // The shape of a selected folder tab takes the place of the tab on this
    // frame.
    updateSelectedTabFollow(strip);
  };

  // Starts the drag of the pressed tab, with the pointer where it is now: past
  // the distance that starts a drag, or still at the press after a long press.
  const startDrag = (pointerX: number) => {
    if (!press) return;
    const { pointerId, tab, touch, x } = press;
    endPress();
    const tabs = getStripTabs(strip);
    const from = tabs.indexOf(tab);
    if (from < 0) return;
    const rtl = isRtl();
    const { translate, transition: tabTransition, scale } = tab.style;
    const styles = new Map<HTMLElement, InlineStyle>([
      [tab, { translate, transition: tabTransition, scale }],
    ]);
    // A pressed tab that isn't selected yet shows a little smaller. The drag
    // measures the tab and its gaps at full size, and the tab keeps that size.
    tab.style.transition = "none";
    tab.style.scale = "none";
    const starts = tabs.map((item) => getStart(item, rtl));
    const sizes = tabs.map((item) => item.getBoundingClientRect().width);
    const gaps = tabs.map((_, index) => {
      const next = starts[index + 1];
      if (next == null) return 0;
      return next - (starts[index] ?? 0) - (sizes[index] ?? 0);
    });
    const children = Array.from(
      strip.querySelectorAll<HTMLElement>(":scope > *"),
    );
    const separators = tabs.map((item) => {
      const previous = children[children.indexOf(item) - 1];
      if (!previous?.classList.contains("control-separator")) return null;
      return previous;
    });
    const reducedMotion = prefersReducedMotion(strip);
    const transition = reducedMotion ? "none" : SHIFT_TRANSITION;
    const separatorTransition = reducedMotion
      ? "none"
      : `${SHIFT_TRANSITION}, opacity 200ms ease-out`;
    for (const element of [...tabs, ...separators]) {
      if (!element) continue;
      if (element === tab) continue;
      styles.set(element, {
        translate: element.style.translate,
        transition: element.style.transition,
        scale: element.style.scale,
      });
      if (tabs.includes(element)) {
        element.style.transition = transition;
      } else {
        // A separator also fades as it hides beside the dragged tab.
        element.style.transition = separatorTransition;
      }
    }
    drag = {
      pointerId,
      tab,
      touch,
      tabs,
      from,
      to: from,
      starts,
      sizes,
      gaps,
      separators,
      origin: getPosition(x, rtl),
      pointerX,
      time: win.performance.now(),
      frame: 0,
      styles,
      shy: [],
      release: followSelectedTab(strip),
    };
    tab.setAttribute("data-dragging", "");
    strip.setAttribute("data-tab-dragging", "");
    markSeparators(drag, from);
    // The tab keeps the pointer when it leaves the strip.
    tab.setPointerCapture(pointerId);
    doc.addEventListener("keydown", onKeyDown, true);
    win.addEventListener("blur", cancelDrag);
    onDragStart?.(tab);
    drag.frame = win.requestAnimationFrame(step);
  };

  // Ends the drag, and slides the tabs from where they show to their places
  // after a change, if any.
  const endDrag = (change?: () => void) => {
    const current = drag;
    if (!current) return;
    drag = null;
    win.cancelAnimationFrame(current.frame);
    removePointerListeners();
    doc.removeEventListener("keydown", onKeyDown, true);
    win.removeEventListener("blur", cancelDrag);
    if (current.tab.hasPointerCapture(current.pointerId)) {
      current.tab.releasePointerCapture(current.pointerId);
    }
    const restore = () => {
      current.tab.removeAttribute("data-dragging");
      strip.removeAttribute("data-tab-dragging");
      for (const element of current.shy) {
        element.removeAttribute("data-shy");
      }
      for (const [element, style] of current.styles) {
        element.style.translate = style.translate;
        element.style.transition = style.transition;
        element.style.scale = style.scale;
      }
    };
    try {
      slideTabs({
        strip,
        tab: current.tab,
        change: () => {
          restore();
          change?.();
        },
      });
    } finally {
      // The slide holds the shape of the tab on its own, also when the change
      // throws.
      current.release();
    }
  };

  // Puts the tab back, with no call, and says so.
  const cancelDrag = () => {
    const current = drag;
    if (!current) return;
    endDrag();
    const { tab, tabs, from } = current;
    announce(getCancelStatus(tab, from, tabs.length));
  };

  // The browser sends a click after the pointer goes up on the tab that holds
  // it, which would press the tab, or its close mark under the pointer.
  const dropClick = () => {
    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };
    win.addEventListener("click", onClick, { capture: true, once: true });
    win.setTimeout(() => win.removeEventListener("click", onClick, true));
  };

  // The pointer is still down after the Escape key, and its click comes when it
  // goes up.
  const dropClickAfterRelease = () => {
    const stop = () => {
      win.removeEventListener("pointerup", onRelease);
      win.removeEventListener("pointercancel", stop);
    };
    const onRelease = () => {
      stop();
      dropClick();
    };
    win.addEventListener("pointerup", onRelease);
    win.addEventListener("pointercancel", stop);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    // The key ends the drag, and doesn't also close a dialog around the tabs.
    event.preventDefault();
    event.stopPropagation();
    cancelDrag();
    dropClickAfterRelease();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (drag) {
      if (event.pointerId !== drag.pointerId) return;
      drag.pointerX = event.clientX;
      return;
    }
    if (!press) return;
    if (event.pointerId !== press.pointerId) return;
    const x = Math.abs(event.clientX - press.x);
    const y = Math.abs(event.clientY - press.y);
    if (!press.touch) {
      if (x < DRAG_DISTANCE) return;
      startDrag(event.clientX);
      return;
    }
    // A finger that moves before the tab is up scrolls instead.
    if (Math.hypot(x, y) < TOUCH_HOLD_DISTANCE) return;
    endPress();
    removePointerListeners();
  };

  const onPointerUp = (event: PointerEvent) => {
    if (press?.pointerId === event.pointerId) {
      endPress();
      removePointerListeners();
      return;
    }
    const current = drag;
    if (!current) return;
    if (event.pointerId !== current.pointerId) return;
    dropClick();
    // The pointer can move and go up between two frames.
    current.pointerX = event.clientX;
    place(current);
    const { tab, tabs, from, to } = current;
    if (to === from) {
      endDrag();
      return;
    }
    const ids = moveItem(tabs, from, to).map((item) => item.id);
    endDrag(() => onReorder(ids));
    announce(getMoveStatus(tab, to, tabs.length));
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (press?.pointerId === event.pointerId) {
      endPress();
      removePointerListeners();
      return;
    }
    if (drag?.pointerId !== event.pointerId) return;
    cancelDrag();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (press) return;
    if (drag) return;
    if (!event.isPrimary) return;
    if (event.button !== 0) return;
    // A press with the Control key opens the context menu on Apple devices.
    if (event.ctrlKey) return;
    const tabs = getStripTabs(strip);
    if (tabs.length < 2) return;
    const tab = tabs.find((item) => event.composedPath().includes(item));
    if (!tab) return;
    if (isFixedTab(tab)) return;
    // A press on the close mark closes the tab.
    const mark = tab.querySelector(".tab-remove");
    if (mark && event.composedPath().includes(mark)) return;
    const touch = event.pointerType === "touch";
    const { pointerId, clientX: x, clientY: y } = event;
    const timer = touch
      ? win.setTimeout(() => startDrag(x), TOUCH_HOLD_TIME)
      : 0;
    press = { pointerId, tab, touch, x, y, timer };
    win.addEventListener("pointermove", onPointerMove);
    win.addEventListener("pointerup", onPointerUp);
    win.addEventListener("pointercancel", onPointerCancel);
  };

  // The browser decides whether a touch scrolls when the touch starts, and then
  // cancels the pointer. Only a touchmove listener that was there before the
  // touch can stop that, so this one is always there, and stops the scroll only
  // while a finger drags a tab.
  const onTouchMove = (event: TouchEvent) => {
    if (!drag?.touch) return;
    if (!event.cancelable) return;
    event.preventDefault();
  };

  // A long press also opens the context menu, or the preview of a link.
  const onContextMenu = (event: MouseEvent) => {
    if (!press?.touch && !drag?.touch) return;
    event.preventDefault();
  };

  // A tab that renders a link would start the drag of the link.
  const onDragStartNative = (event: DragEvent) => {
    event.preventDefault();
  };

  const { style } = strip;
  const touchCallout = style.getPropertyValue("-webkit-touch-callout");
  style.setProperty("-webkit-touch-callout", "none");
  strip.addEventListener("pointerdown", onPointerDown);
  strip.addEventListener("touchmove", onTouchMove, { passive: false });
  strip.addEventListener("contextmenu", onContextMenu);
  strip.addEventListener("dragstart", onDragStartNative);
  return () => {
    endPress();
    endDrag();
    removePointerListeners();
    style.setProperty("-webkit-touch-callout", touchCallout);
    strip.removeEventListener("pointerdown", onPointerDown);
    strip.removeEventListener("touchmove", onTouchMove);
    strip.removeEventListener("contextmenu", onContextMenu);
    strip.removeEventListener("dragstart", onDragStartNative);
  };
}
