import {
  addGlobalEventListener,
  chain,
  contains,
  getDocument,
  isElement,
  isNode,
} from "@ariakit/utils";
import type { HovercardStore } from "./hovercard-store.ts";

/** An anchor that a scroll can hover. */
export interface ScrollHoverAnchor {
  store: HovercardStore;
  getElement: () => HTMLElement | null;
  /** Whether the scroll counts as hover for this anchor. */
  canHover: (event: Event) => boolean;
  /** Acts like a mouse move onto the anchor. */
  hover: () => void;
}

/** The resting mouse position in the document of a scroll. */
export interface ScrollHoverPoint {
  x: number;
  y: number;
  document: Document;
}

/**
 * Receives each scroll that counts as hover, with the element under the mouse
 * and its ancestors, from the innermost one out.
 */
export type ScrollHoverListener = (
  event: Event,
  path: Element[],
  point: ScrollHoverPoint,
) => void;

interface Mouse {
  x: number;
  y: number;
  // The innermost element under the mouse.
  target: Element | null;
  // Scrolls count as hover after a mouse move, until a press, a key press, a
  // touch or pen input, or the mouse leaving the document.
  armed: boolean;
}

const anchors = new Set<ScrollHoverAnchor>();
const listeners = new Set<ScrollHoverListener>();
let mice = new WeakMap<Document, Mouse>();
let removeGlobalListeners: (() => void) | null = null;

function getEventDocument(event: Event) {
  return getDocument(isNode(event.target) ? event.target : null);
}

function getPath(element: Element | null) {
  const path: Element[] = [];
  for (let node = element; node; node = node.parentElement) {
    path.push(node);
  }
  return path;
}

// One element can be the anchor of more than one store, such as a tooltip
// anchor that renders a hovercard anchor.
function getAnchorsByElement() {
  const anchorsByElement = new Map<Element, ScrollHoverAnchor[]>();
  for (const anchor of anchors) {
    const element = anchor.getElement();
    if (!element) continue;
    const elementAnchors = anchorsByElement.get(element);
    if (elementAnchors) {
      elementAnchors.push(anchor);
      continue;
    }
    anchorsByElement.set(element, [anchor]);
  }
  return anchorsByElement;
}

function findAnchors(
  path: Element[],
  anchorsByElement: Map<Element, ScrollHoverAnchor[]>,
) {
  return path.flatMap((element) => anchorsByElement.get(element) ?? []);
}

// Modifier keys don't scroll the page, and Shift with the mouse wheel scrolls
// sideways.
const modifierKeys = new Set(["Shift", "Control", "Alt", "Meta"]);

function disarm(event: Event) {
  const mouse = mice.get(getEventDocument(event));
  if (!mouse) return;
  mouse.armed = false;
}

function onKeyDown(event: KeyboardEvent) {
  if (modifierKeys.has(event.key)) return;
  disarm(event);
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerType !== "mouse" || event.buttons) {
    disarm(event);
    return;
  }
  const document = getEventDocument(event);
  const mouse = mice.get(document);
  // The listener is on the document, so the target is retargeted out of shadow
  // roots, like the element at a point that a scroll reads below.
  const { target } = event;
  // Some browsers send a mousemove without movement after a scroll. It must not
  // count as a mouse move.
  const armed =
    !mouse ||
    mouse.armed ||
    mouse.x !== event.clientX ||
    mouse.y !== event.clientY;
  mice.set(document, {
    x: event.clientX,
    y: event.clientY,
    target: isElement(target) ? target : null,
    armed,
  });
}

function onMouseOut(event: MouseEvent) {
  // The mouse left the document.
  if (event.relatedTarget) return;
  disarm(event);
}

function onScroll(event: Event) {
  const document = getEventDocument(event);
  const mouse = mice.get(document);
  if (!mouse?.armed) return;
  const anchorsByElement = getAnchorsByElement();
  const previousAnchors = new Set(
    findAnchors(getPath(mouse.target), anchorsByElement),
  );
  // A scroll event fires after the browser updates the layout, so the element
  // at the resting mouse position is already the one that scrolled under it.
  mouse.target = document.elementFromPoint(mouse.x, mouse.y);
  const path = getPath(mouse.target);
  // Like a mouse move, the scroll reaches every anchor under the mouse, such as
  // a tooltip anchor inside a hovercard anchor, but only the anchors that it
  // moved under the mouse act.
  for (const anchor of findAnchors(path, anchorsByElement)) {
    if (previousAnchors.has(anchor)) continue;
    if (!anchor.canHover(event)) continue;
    anchor.hover();
  }
  const point = { x: mouse.x, y: mouse.y, document };
  for (const listener of listeners) {
    listener(event, path, point);
  }
}

/**
 * Registers an anchor that a scroll can hover. Scrolls under a resting mouse
 * are tracked only while at least one such anchor exists. Returns a function
 * that removes the anchor.
 */
export function addScrollHoverAnchor(anchor: ScrollHoverAnchor) {
  anchors.add(anchor);
  // Listeners on the capture phase of the document run before the scroll
  // listeners that update popover positions on the scroll containers. So a
  // popover moves to the anchor under the mouse before the old anchor's
  // position update runs.
  if (!removeGlobalListeners) {
    removeGlobalListeners = chain(
      addGlobalEventListener("pointermove", onPointerMove, true),
      addGlobalEventListener("pointerdown", disarm, true),
      addGlobalEventListener("keydown", onKeyDown, true),
      addGlobalEventListener("mouseout", onMouseOut, true),
      addGlobalEventListener("scroll", onScroll, true),
    );
  }
  return () => {
    anchors.delete(anchor);
    if (anchors.size) return;
    removeGlobalListeners?.();
    removeGlobalListeners = null;
    // Nothing tracks the mouse without listeners, so a later anchor must wait
    // for the next mouse move.
    mice = new WeakMap();
  };
}

/**
 * Listens to the scrolls that count as hover. A listener runs after the anchor
 * under the mouse acts on the scroll. Returns a function that removes the
 * listener.
 */
export function addScrollHoverListener(listener: ScrollHoverListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Returns the scroll hover anchor that an element registered for a store. */
export function getScrollHoverAnchor(element: Element, store: HovercardStore) {
  for (const anchor of anchors) {
    if (anchor.store !== store) continue;
    if (anchor.getElement() !== element) continue;
    return anchor;
  }
  return null;
}

/** Whether the resting mouse is over the element after a scroll. */
export function isScrollHovered(element: Element) {
  const mouse = mice.get(getDocument(element));
  if (!mouse?.armed) return false;
  if (!mouse.target) return false;
  return contains(element, mouse.target);
}
