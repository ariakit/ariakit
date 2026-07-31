import { getWindow, isElement } from "@ariakit/utils";

interface ScrollPosition {
  element: Element;
  left: number;
  top: number;
}

function getShadowHost(element: Element) {
  const root = element.getRootNode();
  // Node.DOCUMENT_FRAGMENT_NODE === 11. Avoid the global Node and ShadowRoot
  // constructors so this works for elements from another realm.
  if (root.nodeType !== 11) return null;
  const host = (root as ShadowRoot).host;
  return isElement(host) ? host : null;
}

function getFrameElement(element: Element) {
  try {
    const frameElement = getWindow(element).frameElement;
    return isElement(frameElement) ? frameElement : null;
  } catch {
    return null;
  }
}

function getComposedParent(element: Element) {
  return (
    element.assignedSlot ??
    element.parentElement ??
    getShadowHost(element) ??
    getFrameElement(element)
  );
}

function isComposedAncestor(element: Element, ancestor: Element) {
  let current = getComposedParent(element);
  while (current) {
    if (current === ancestor) return true;
    current = getComposedParent(current);
  }
  return false;
}

function getAncestorScrollPositions(boundary: HTMLElement) {
  const positions: ScrollPosition[] = [];
  let current = getComposedParent(boundary);
  while (current) {
    positions.push({
      element: current,
      left: current.scrollLeft,
      top: current.scrollTop,
    });
    current = getComposedParent(current);
  }
  return positions;
}

function restoreScrollPositions(positions: ScrollPosition[]) {
  for (const { element, left, top } of positions.reverse()) {
    element.scrollTo({ left, top, behavior: "instant" });
  }
}

/**
 * Centers an element within each scroll container up to and including the
 * boundary while preserving scroll positions outside the boundary.
 *
 * Does nothing unless the boundary is a composed ancestor of the element.
 */
export function centerIntoView(element: HTMLElement, boundary: HTMLElement) {
  if (!isComposedAncestor(element, boundary)) return;
  const positions = getAncestorScrollPositions(boundary);
  try {
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
    element.scrollIntoView({ block: "center", inline: "nearest" });
  } finally {
    restoreScrollPositions(positions);
  }
}
