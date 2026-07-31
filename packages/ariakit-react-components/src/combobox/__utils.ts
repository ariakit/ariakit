import { getWindow } from "@ariakit/utils";
import type { ComboboxStore } from "./combobox-store.ts";

interface ScrollPosition {
  element: Element;
  left: number;
  top: number;
}

function getParentElement(element: Element) {
  // Use light-DOM ancestry for slotted boundaries. Their shadow-side scroll
  // containers also move during the surrounding open/focus sequence, so this
  // presentation pass cannot keep those positions stable.
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  // Node.DOCUMENT_FRAGMENT_NODE === 11. Avoid the global Node and ShadowRoot
  // constructors so this works for elements from another realm.
  if (root.nodeType === 11) {
    const host = (root as ShadowRoot).host;
    if (host) return host;
  }
  try {
    return getWindow(element).frameElement;
  } catch {
    return null;
  }
}

function getAncestorScrollPositions(boundary: HTMLElement) {
  const positions: ScrollPosition[] = [];
  let current = getParentElement(boundary);
  while (current) {
    positions.push({
      element: current,
      left: current.scrollLeft,
      top: current.scrollTop,
    });
    current = getParentElement(current);
  }
  return positions;
}

function restoreScrollPositions(positions: ScrollPosition[]) {
  for (const { element, left, top } of positions.reverse()) {
    element.scrollTo({ left, top, behavior: "instant" });
  }
}

function centerIntoView(element: HTMLElement, boundary: HTMLElement) {
  const positions = getAncestorScrollPositions(boundary);
  try {
    element.scrollIntoView({ block: "center", inline: "nearest" });
  } finally {
    restoreScrollPositions(positions);
  }
}

export function scrollSelectedItemIntoView(
  store: ComboboxStore,
  element: HTMLElement,
) {
  const { contentElement, selectElement, selectedValue } = store.getState();
  if (!selectElement) return;
  if (!contentElement) return;
  const value = Array.isArray(selectedValue)
    ? selectedValue.at(-1)
    : selectedValue;
  if (value == null) return;
  if (store.item(element.id)?.value !== value) return;
  centerIntoView(element, contentElement);
}
