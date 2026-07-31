import { getWindow } from "@ariakit/utils";
import type { ComboboxStore } from "./combobox-store.ts";

interface ScrollPosition {
  element: Element;
  left: number;
  top: number;
}

function getParentElement(element: Element) {
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
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
