import { getWindow } from "@ariakit/utils";
import * as React from "react";

type NavBarRef = React.RefObject<HTMLElement | null>;

export interface NavBarTravelStore {
  /**
   * Makes a bar the bar of a current link, and returns a function that undoes
   * it.
   */
  addCurrent: (bar: NavBarRef) => () => void;
}

/**
 * The bar travel of the navigation around a link, when its style component has
 * one. The bars of current links register in it.
 */
export const NavBarTravelContext =
  React.createContext<NavBarTravelStore | null>(null);

// In these modes, the bar of the new current link shows at once.
const offQuery = "(forced-colors: active), (prefers-reduced-motion: reduce)";

interface NavBarPlace {
  x: number;
  y: number;
  width: number;
  height: number;
}

function isSamePlace(a: NavBarPlace, b: NavBarPlace) {
  if (a.x !== b.x) return false;
  if (a.y !== b.y) return false;
  if (a.width !== b.width) return false;
  return a.height === b.height;
}

// The place of a bar from the start of the scrollable content of the root,
// which stays the same while the root scrolls. A bar without a box has none.
function getPlace(root: HTMLElement, bar: HTMLElement): NavBarPlace | null {
  if (!bar.getClientRects().length) return null;
  // Rects include the CSS zoom of the root, unlike the lengths that place the
  // bar that travels in CSS.
  const zoom = root.currentCSSZoom || 1;
  const rootRect = root.getBoundingClientRect();
  const rect = bar.getBoundingClientRect();
  return {
    x: (rect.left - rootRect.left) / zoom - root.clientLeft + root.scrollLeft,
    y: (rect.top - rootRect.top) / zoom - root.clientTop + root.scrollTop,
    width: rect.width / zoom,
    height: rect.height / zoom,
  };
}

// Only an overflow that scrolls makes a scroll area. A disclosure panel clips
// its content while it opens, and the travel follows a bar in that panel.
function isScrollOverflow(value: string) {
  return value === "auto" || value === "scroll";
}

function isScrollArea(view: Window, element: HTMLElement) {
  const { overflowX, overflowY } = view.getComputedStyle(element);
  if (isScrollOverflow(overflowY)) {
    if (element.scrollHeight > element.clientHeight) return true;
  }
  if (!isScrollOverflow(overflowX)) return false;
  return element.scrollWidth > element.clientWidth;
}

// Whether a scroll area between the bar and the root hides part of the bar,
// such as the open section of a filled disclosure group. The bar that travels
// is on the root, outside that area, so it would show over the rows around the
// area. The root clips the bar that travels by itself.
function isClipped(root: HTMLElement, bar: HTMLElement) {
  const view = getWindow(root);
  const rect = bar.getBoundingClientRect();
  let element = bar.parentElement;
  while (element && element !== root) {
    if (isScrollArea(view, element)) {
      const area = element.getBoundingClientRect();
      // Half a pixel absorbs the rounding of fractional layouts.
      if (rect.top < area.top - 0.5) return true;
      if (rect.bottom > area.bottom + 0.5) return true;
      if (rect.left < area.left - 0.5) return true;
      if (rect.right > area.right + 0.5) return true;
    }
    element = element.parentElement;
  }
  return false;
}

// The place that a bar has while its link is current, or null when a scroll
// area hides it. CSS hides the bar of a link that is not current, so the bar
// shows for the measurement. The browser doesn't paint between the two steps.
function getHiddenPlace(root: HTMLElement, bar: HTMLElement) {
  const { display } = bar.style;
  bar.style.display = "block";
  const place = isClipped(root, bar) ? null : getPlace(root, bar);
  bar.style.display = display;
  return place;
}

// The values that the navigation gives to the bar that travels, which is its
// `::after` pseudo-element.
const travelerProperties = [
  "--glider-x",
  "--glider-y",
  "--glider-width",
  "--glider-height",
  "--nav-bar-traveler-color",
  "--nav-bar-traveler-radius",
];

// Whether the bar that travels is still on its way. The transitions of a
// pseudo-element are in the list of its element only with the subtree.
function isTraveling(root: HTMLElement) {
  return root.getAnimations({ subtree: true }).some((animation) => {
    const { effect } = animation;
    if (!effect) return false;
    // Only a keyframe effect has a target. The check also takes an effect from
    // another realm.
    if (!("target" in effect)) return false;
    if (!("pseudoElement" in effect)) return false;
    if (effect.target !== root) return false;
    return effect.pseudoElement === "::after";
  });
}

export interface UseNavBarTravelParams {
  /**
   * The navigation element, with the `nav` style recipe. Its `::after`
   * pseudo-element is the bar that travels.
   */
  rootRef: React.RefObject<HTMLElement | null>;
}

function createNavBarTravel({ rootRef }: UseNavBarTravelParams) {
  const currents = new Set<NavBarRef>();
  // The bar that the last update found, which the travel starts from.
  let previous: HTMLElement | null = null;
  // The bar that the travel goes to, which stays hidden until it ends.
  let target: HTMLElement | null = null;
  let place: NavBarPlace | null = null;
  let cancelFrame: (() => void) | null = null;
  let scheduled = false;

  // An equal place writes nothing, so a frame of the travel changes the styles
  // of the navigation only when the bar moved.
  const moveTo = (root: HTMLElement, next: NavBarPlace) => {
    if (place && isSamePlace(place, next)) return;
    place = next;
    root.style.setProperty("--glider-x", `${next.x}px`);
    root.style.setProperty("--glider-y", `${next.y}px`);
    root.style.setProperty("--glider-width", `${next.width}px`);
    root.style.setProperty("--glider-height", `${next.height}px`);
  };

  // The bar that travels goes away, and the bar that it went to shows again.
  const finish = () => {
    cancelFrame?.();
    cancelFrame = null;
    target?.style.removeProperty("visibility");
    target = null;
    place = null;
    const root = rootRef.current;
    if (!root) return;
    root.removeAttribute("data-bar-traveling");
    for (const property of travelerProperties) {
      root.style.removeProperty(property);
    }
  };

  // The layout can move the bar of the new current link during the travel, such
  // as when a disclosure opens around the link, so the travel turns to the
  // place of that bar again. Returns whether the travel still goes on.
  const turn = () => {
    const root = rootRef.current;
    if (!root) return false;
    if (!target) return false;
    const next = getPlace(root, target);
    if (!next) return false;
    moveTo(root, next);
    // Reading the animations applies the new place first, so a transition that
    // it starts is in the list.
    return isTraveling(root);
  };

  // The travel turns in each frame, and ends when the bar arrives.
  const follow = (view: Window) => {
    const id = view.requestAnimationFrame(() => {
      cancelFrame = null;
      if (!turn()) {
        finish();
        return;
      }
      follow(view);
    });
    cancelFrame = () => view.cancelAnimationFrame(id);
  };

  // What a travel to a bar needs. Without one of these, the bar shows at once.
  const getTravel = (bar?: HTMLElement | null) => {
    const root = rootRef.current;
    if (!bar) return null;
    if (!root) return null;
    const view = getWindow(root);
    if (view.matchMedia(offQuery).matches) return null;
    if (isClipped(root, bar)) return null;
    const to = getPlace(root, bar);
    if (!to) return null;
    return { root, view, to };
  };

  const update = () => {
    scheduled = false;
    const [current] = currents;
    // One travel can't go to the bars of several current links.
    const bar = currents.size === 1 ? current?.current : null;
    const from = previous;
    previous = bar ?? null;
    if (bar && bar === target) return;
    // Without a travel to turn, a travel starts from the bar of the last
    // current link. The first bar of a navigation has no bar to come from, and
    // shows at once, like the bar of a link that comes back. These checks come
    // before any measurement, so a navigation that mounts measures nothing.
    if (bar && !target) {
      if (!from?.isConnected) return;
      if (from === bar) return;
    }
    const travel = getTravel(bar);
    if (!bar || !travel) {
      finish();
      return;
    }
    const { root, view, to } = travel;
    // The bar that travels takes the look of the bar that it goes to.
    const { backgroundColor, borderRadius } = view.getComputedStyle(bar);
    if (target) {
      // The travel turns to the new bar from where it is. CSS hides the bar
      // that it went to, because the link of that bar is not current now.
      target.style.removeProperty("visibility");
      cancelFrame?.();
    } else {
      if (!from) return;
      const start = getHiddenPlace(root, from);
      if (!start) return;
      root.setAttribute("data-bar-instant", "");
      moveTo(root, start);
      root.setAttribute("data-bar-traveling", "");
      // Reading a style applies the place before the transition comes back.
      view.getComputedStyle(root, "::after").getPropertyValue("--glider-x");
      root.removeAttribute("data-bar-instant");
    }
    root.style.setProperty("--nav-bar-traveler-color", backgroundColor);
    root.style.setProperty("--nav-bar-traveler-radius", borderRadius);
    moveTo(root, to);
    // A hidden bar keeps its box, which each frame of the travel measures.
    bar.style.visibility = "hidden";
    target = bar;
    follow(view);
  };

  // In one update, the bar of the old link leaves before the bar of the new one
  // comes. The travel waits for both, so it goes from one bar to the other.
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(update);
  };

  const store: NavBarTravelStore = {
    addCurrent: (bar) => {
      currents.add(bar);
      scheduleUpdate();
      return () => {
        currents.delete(bar);
        scheduleUpdate();
      };
    },
  };
  return store;
}

/**
 * Moves a copy of the bar from the last current link of a navigation to the new
 * one, for bars that each link draws by itself. The copy is the `::after`
 * pseudo-element of the navigation, which the `nav` style recipe styles, so the
 * navigation gets no extra child. It shows only during the travel: the bar of
 * the new current link stays hidden until the copy arrives, and then shows in
 * its place. With forced colors or reduced motion, the bars change at once.
 * They also change at once when a scroll area in the navigation hides the old
 * or the new bar. Provide the returned store with `NavBarTravelContext`, so the
 * bars of the current links register in it.
 * @example
 * const barTravel = useNavBarTravel({ rootRef });
 * <NavBarTravelContext.Provider value={barTravel}>
 *   <nav ref={rootRef} {...nav.jsx()} />
 * </NavBarTravelContext.Provider>
 */
export function useNavBarTravel({ rootRef }: UseNavBarTravelParams) {
  return React.useMemo(() => createNavBarTravel({ rootRef }), [rootRef]);
}
