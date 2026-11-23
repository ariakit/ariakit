import { getWindow, isApple } from "@ariakit/utils";
import { scrollIntoClearRange } from "./carousel-clear.ts";

// How long the tabs take to slide to their new places, in milliseconds.
const SLIDE_TIME = 200;
const SLIDE_EASING = "cubic-bezier(0.3, 0, 0, 1)";
const SLIDE_ID = "tab-slide";

// A fast series of moves would fill the queue of a screen reader, so the status
// text waits for the moves to stop.
const STATUS_DELAY = 150;

export interface TabReorderParams {
  /** The element with the `tablist` role. */
  strip: HTMLElement;
  /** Called once after each move, with the IDs of the tabs in the new order. */
  onReorder: (ids: string[]) => void;
  /** Speaks a text to screen reader users. */
  announce: (text: string) => void;
}

/** The tabs of a strip, in their order in the page. */
export function getStripTabs(strip: HTMLElement) {
  return Array.from(strip.querySelectorAll<HTMLElement>(":scope > [role=tab]"));
}

/** Whether people can't move a tab: a disabled tab, or a tab that closes. */
export function isFixedTab(tab: HTMLElement) {
  if (tab.hasAttribute("data-leave")) return true;
  return tab.matches(":disabled, [aria-disabled=true]");
}

/** Whether people set the system to show less motion. */
export function prefersReducedMotion(element: HTMLElement) {
  const query = "(prefers-reduced-motion: reduce)";
  return getWindow(element).matchMedia(query).matches;
}

/** Returns a copy of a list with one item at another index. */
export function moveItem<T>(items: readonly T[], from: number, to: number) {
  const next = [...items];
  if (from < 0) return next;
  if (from >= next.length) return next;
  const [item] = next.splice(from, 1);
  // The index check above proves that the item is there, also when the list
  // holds undefined values.
  next.splice(to, 0, item as T);
  return next;
}

function getTabName(tab: HTMLElement) {
  return tab.getAttribute("aria-label") || tab.textContent?.trim() || "Tab";
}

/** The text that tells screen reader users where a tab is now. */
export function getMoveStatus(tab: HTMLElement, index: number, count: number) {
  return `${getTabName(tab)} moved to position ${index + 1} of ${count}`;
}

/** The text that tells screen reader users that a tab went back. */
export function getCancelStatus(
  tab: HTMLElement,
  index: number,
  count: number,
) {
  return `${getTabName(tab)} is back at position ${index + 1} of ${count}`;
}

const statusTimers = new WeakMap<HTMLElement, number>();

/**
 * Writes a text to a live region after a short time without a newer text, so a
 * series of fast moves speaks only its last place.
 */
export function setTabStatus(status: HTMLElement | null, text: string) {
  if (!status) return;
  const win = getWindow(status);
  win.clearTimeout(statusTimers.get(status));
  const write = () => {
    // The same text twice in a row has no change to speak, so the region
    // empties first.
    status.textContent = "";
    status.textContent = text;
  };
  statusTimers.set(status, win.setTimeout(write, STATUS_DELAY));
}

interface Follow {
  count: number;
  stop: () => void;
  update: () => void;
}

const follows = new WeakMap<HTMLElement, Follow>();

function startFollow(strip: HTMLElement) {
  const win = getWindow(strip);
  // The row counts the controls beside the strip, so a control there keeps the
  // corner of the panel round.
  const parent = strip.parentElement;
  const row = parent?.classList.contains("tab-row") ? parent : strip;
  // The elements that follow the box of a glider, such as the panels, follow a
  // tab that moves by the same rules.
  const scope = strip.closest<HTMLElement>(".glider-scope");
  const followers = Array.from(
    scope?.querySelectorAll<HTMLElement>(".glider-follower") ?? [],
  ).filter((follower) => follower.closest(".glider-scope") === scope);
  const rtl = win.getComputedStyle(strip).direction === "rtl";
  const places = new Map<HTMLElement, string>();
  const clear = (element: HTMLElement) => {
    places.delete(element);
    element.removeAttribute("data-tab-moving");
    element.style.removeProperty("--tab-move-start");
    element.style.removeProperty("--tab-move-end");
  };
  let frame = 0;
  const update = () => {
    const tab = strip.querySelector<HTMLElement>(
      ":scope > [role=tab][aria-selected=true]",
    );
    // Only a folder tab meets the corners of the panels. A selected tab of
    // another kind still gets its mark, which a glider in the strip reads.
    const folder = tab?.classList.contains("ui-folder");
    const elements = tab ? [tab, ...(folder ? followers : [])] : [];
    for (const element of places.keys()) {
      if (elements.includes(element)) continue;
      clear(element);
    }
    if (!tab) return;
    const tabRect = tab.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const left = Math.max(0, tabRect.left - rowRect.left);
    const right = Math.max(0, rowRect.right - tabRect.right);
    const start = (rtl ? right : left).toFixed(1);
    const end = (rtl ? left : right).toFixed(1);
    const place = `${start}|${end}`;
    for (const element of elements) {
      // The same value would still restyle the element on each frame.
      if (places.get(element) === place) continue;
      places.set(element, place);
      element.setAttribute("data-tab-moving", "");
      element.style.setProperty("--tab-move-start", `${start}px`);
      element.style.setProperty("--tab-move-end", `${end}px`);
    }
  };
  const step = () => {
    frame = win.requestAnimationFrame(step);
    update();
  };
  step();
  const stop = () => {
    win.cancelAnimationFrame(frame);
    for (const element of Array.from(places.keys())) {
      clear(element);
    }
  };
  return { stop, update };
}

/**
 * Marks the selected tab of a strip while it moves, and makes the shape of a
 * selected folder tab and of its panels follow the place where the tab shows,
 * on each frame. The order of the tabs in the page sets that shape at rest, and
 * a tab that moves shows away from its place in the page. The tab gets
 * `data-tab-moving`, and `--tab-move-start` and `--tab-move-end`: how far it is
 * from the start and from the end of its row. The panels and a sticky tab row
 * of a folder tab get them too. Returns a function that gives the shape back to
 * the order of the tabs.
 */
export function followSelectedTab(strip: HTMLElement) {
  const follow = follows.get(strip) ?? { count: 0, ...startFollow(strip) };
  follow.count += 1;
  follows.set(strip, follow);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    follow.count -= 1;
    if (follow.count) return;
    follows.delete(strip);
    follow.stop();
  };
}

/**
 * Makes the shape that follows the selected tab of a strip take the place where
 * the tab shows now, such as right after a drag moves the tab on a frame. The
 * frame loop of `followSelectedTab` can run before the code that moves the tab
 * on the same frame, and would show the place of the frame before.
 */
export function updateSelectedTabFollow(strip: HTMLElement) {
  follows.get(strip)?.update();
}

interface SlideTabsParams {
  strip: HTMLElement;
  /** A tab to keep in view of the strip at its new place. */
  tab?: HTMLElement;
  /** Changes the places of the tabs, such as with a new order. */
  change: () => void;
}

function getStripSeparators(strip: HTMLElement) {
  return Array.from(
    strip.querySelectorAll<HTMLElement>(":scope > .control-separator"),
  );
}

/** The separators of a strip with their places, from left to right. */
function getSeparatorLefts(strip: HTMLElement) {
  return getStripSeparators(strip)
    .map((element) => ({ element, left: element.getBoundingClientRect().left }))
    .sort((a, b) => a.left - b.left);
}

/**
 * Slides the tabs and the separators of a strip from where they show to their
 * new places, after a change that moves them at once, such as a new order. The
 * framework can apply the change later than the call, so the slide starts when
 * the children of the strip change, or on the next frame without a change.
 */
export function slideTabs({ strip, tab, change }: SlideTabsParams) {
  const win = getWindow(strip);
  const lefts = new Map<HTMLElement, number>();
  for (const item of getStripTabs(strip)) {
    lefts.set(item, item.getBoundingClientRect().left);
  }
  // A separator is a part of its tab in the page, so it goes with the tab to
  // the new place of the tab. On the screen, the separators stay between the
  // same places, so each one slides from the separator that showed at its place
  // in the row before, and not from where it was itself.
  const separatorLefts = getSeparatorLefts(strip).map(({ left }) => left);
  // The shape of the selected tab follows the tab from before the change, so no
  // frame shows the shape of the new order at the old place.
  const release = followSelectedTab(strip);
  // The inline transitions of the separators during the change.
  const transitions = new Map<HTMLElement, string>();
  let played = false;
  const play = () => {
    if (played) return;
    played = true;
    observer.disconnect();
    win.cancelAnimationFrame(frame);
    // A separator that the new order added, such as before a tab that left the
    // first place, takes its look at once too. Chrome can start its fade from
    // the look that it had with no tab after it.
    for (const child of getStripSeparators(strip)) {
      if (transitions.has(child)) continue;
      transitions.set(child, child.style.transition);
      child.style.transition = "none";
    }
    const separators = getSeparatorLefts(strip);
    const moved = new Map<HTMLElement, number>();
    for (const [element, left] of lefts) {
      if (!element.isConnected) continue;
      moved.set(element, left);
    }
    // With another number of separators, such as when a tab leaves, no
    // separator has a place from before.
    if (separators.length === separatorLefts.length) {
      separators.forEach(({ element }, index) => {
        const left = separatorLefts[index];
        if (left == null) return;
        moved.set(element, left);
      });
    }
    for (const element of moved.keys()) {
      for (const animation of element.getAnimations()) {
        if (animation.id !== SLIDE_ID) continue;
        animation.cancel();
      }
    }
    const reducedMotion = prefersReducedMotion(strip);
    const distances = new Map<HTMLElement, number>();
    if (!reducedMotion) {
      for (const [element, left] of moved) {
        distances.set(element, left - element.getBoundingClientRect().left);
      }
    }
    // The separators hide beside the selected tab. A separator that takes the
    // place of another one in the row takes its look at once, with no fade
    // between the two. This read applies the new look before the fades come
    // back.
    for (const element of transitions.keys()) {
      win.getComputedStyle(element).getPropertyValue("opacity");
    }
    for (const [element, transition] of transitions) {
      element.style.transition = transition;
    }
    if (tab?.isConnected) {
      scrollIntoClearRange(strip, tab, reducedMotion ? "instant" : "smooth");
    }
    const slides: Animation[] = [];
    for (const [element, distance] of distances) {
      if (Math.abs(distance) < 0.5) continue;
      const keyframes = { translate: [`${distance}px 0`, "0 0"] };
      const options = { duration: SLIDE_TIME, easing: SLIDE_EASING };
      const slide = element.animate(keyframes, { ...options, id: SLIDE_ID });
      slides.push(slide);
    }
    // A slide that a new slide cancels rejects its promise.
    const finished = slides.map((slide) => slide.finished);
    void Promise.allSettled(finished).then(release);
  };
  const observer = new win.MutationObserver(play);
  observer.observe(strip, { childList: true });
  const frame = win.requestAnimationFrame(play);
  try {
    change();
  } finally {
    // With a change that throws, such as an onReorder call with a bug, the
    // slide still plays and gives the tabs their shape back.
    for (const element of getStripSeparators(strip)) {
      transitions.set(element, element.style.transition);
      element.style.transition = "none";
    }
  }
}

/**
 * Moves a tab to another index among the tabs of its strip. Calls `onReorder`
 * with the new order, slides the tabs to their new places, and speaks the new
 * place of the tab. Returns whether the tab has a new place.
 */
export function moveTab(
  { strip, onReorder, announce }: TabReorderParams,
  tab: HTMLElement,
  index: number,
) {
  const tabs = getStripTabs(strip);
  const from = tabs.indexOf(tab);
  if (from < 0) return false;
  const to = Math.max(0, Math.min(tabs.length - 1, index));
  if (to === from) return false;
  const ids = moveItem(tabs, from, to).map((item) => item.id);
  slideTabs({ strip, tab, change: () => onReorder(ids) });
  announce(getMoveStatus(tab, to, tabs.length));
  return true;
}

interface GetKeyIndexParams {
  key: string;
  /** The index of the tab that has focus. */
  index: number;
  /** The number of tabs in the strip. */
  count: number;
  rtl: boolean;
}

/** The index that a key moves a tab to, if the key moves tabs. */
function getKeyIndex({ key, index, count, rtl }: GetKeyIndexParams) {
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  if (key === "ArrowLeft") return rtl ? index + 1 : index - 1;
  if (key === "ArrowRight") return rtl ? index - 1 : index + 1;
  return null;
}

/**
 * Lets people move the focused tab of a strip with Ctrl+Shift, or Command+Shift
 * on Apple devices, and the Left and Right Arrow keys, or the Home and End
 * keys. Plain arrow keys still move the focus. Returns a function that stops
 * this.
 */
export function observeTabReorderKeys(params: TabReorderParams) {
  const { strip } = params;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    if (!event.shiftKey) return;
    if (event.altKey) return;
    const apple = isApple();
    if (apple ? !event.metaKey : !event.ctrlKey) return;
    if (apple ? event.ctrlKey : event.metaKey) return;
    const tabs = getStripTabs(strip);
    const from = tabs.findIndex((tab) => tab === event.target);
    const tab = tabs[from];
    if (!tab) return;
    const rtl = getWindow(strip).getComputedStyle(strip).direction === "rtl";
    const to = getKeyIndex({
      key: event.key,
      index: from,
      count: tabs.length,
      rtl,
    });
    if (to == null) return;
    // The tabs don't take the key as a plain arrow key, which moves the focus.
    event.preventDefault();
    if (isFixedTab(tab)) return;
    moveTab(params, tab, to);
  };
  strip.addEventListener("keydown", onKeyDown);
  return () => strip.removeEventListener("keydown", onKeyDown);
}
