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

// Centers the element in every scrollport between it and the popup, without
// letting that cascade reach the page.
//
// `scrollIntoView` centers the element in each of its scrollports in turn, and
// the viewport is one of them, so it scrolls the page to center an element that
// is already on screen. Restoring the page afterwards hides the movement, but
// the scroll still happened: the page dispatches a scroll event, and on macOS
// that briefly reveals the page's overlay scrollbar on every open.
//
// A `position: fixed` element can't be brought into view by scrolling anything
// outside its containing block, so pinning the popup for the duration of the
// call stops the cascade at the popup while leaving the scrollports inside it
// to the browser.
//
// Pinning does displace the popup, because it re-resolves its placement
// against the viewport instead of against whatever contained it as an
// absolutely positioned box. Keep this whole sequence synchronous:
// nothing may paint between pinning and restoring, or the popup visibly jumps.
// The scrollports inside the popup move with it, so where they end up
// scrolling to is unaffected.
//
// Two things put scrollports outside the popup's containing block, so the
// cascade still reaches them and the scrollbar still appears: an ancestor that
// establishes a fixed containing block, through a transform, filter,
// `will-change` or `contain`, in every browser; and a frame boundary in Firefox
// and Safari, where pinning only reaches that frame's own viewport. Restoring
// the ancestor positions is what keeps those scrollports from ending up moved,
// in those cases and in every other.
function centerIntoView(
  element: HTMLElement,
  boundary: HTMLElement,
  popup: HTMLElement | null,
) {
  const positions = getAncestorScrollPositions(boundary);
  const position = popup?.style.position ?? "";
  if (popup) {
    popup.style.position = "fixed";
  }
  try {
    // Scrolling instantly keeps the whole cascade inside the synchronous
    // window, the way the restore below already does, so a consumer's
    // `scroll-behavior: smooth` can't animate what the cascade does reach.
    element.scrollIntoView({
      behavior: "instant",
      block: "center",
      inline: "nearest",
    });
  } finally {
    if (popup) {
      popup.style.position = position;
    }
    restoreScrollPositions(positions);
  }
}

export function scrollSelectedItemIntoView(
  store: ComboboxStore,
  element: HTMLElement,
) {
  const { contentElement, popoverElement, selectElement, selectedValue } =
    store.getState();
  if (!selectElement) return;
  if (!contentElement) return;
  const value = Array.isArray(selectedValue)
    ? selectedValue.at(-1)
    : selectedValue;
  if (value == null) return;
  if (store.item(element.id)?.value !== value) return;
  centerIntoView(element, contentElement, popoverElement);
}
