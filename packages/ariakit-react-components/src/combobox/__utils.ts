import { withDocumentScrollPreserved } from "../composite/utils.ts";
import type { ComboboxStore } from "./combobox-store.ts";

function getVerticalScrollingElement(element: HTMLElement) {
  const window = element.ownerDocument.defaultView;
  const HTMLElementClass = window?.HTMLElement;
  if (!window || !HTMLElementClass) return null;
  let current = element.parentElement;
  while (current) {
    const { overflowY } = window.getComputedStyle(current);
    const scrollable = overflowY === "auto" || overflowY === "scroll";
    if (
      scrollable &&
      current.clientHeight &&
      current.scrollHeight > current.clientHeight
    ) {
      return current;
    }
    current = current.parentElement;
  }
  const documentScroller =
    element.ownerDocument.scrollingElement || element.ownerDocument.body;
  if (!(documentScroller instanceof HTMLElementClass)) return null;
  return documentScroller;
}

function getPixelValue(value: string, base: number) {
  const number = parseFloat(value);
  if (!Number.isFinite(number)) return 0;
  if (value.endsWith("%")) return (number / 100) * base;
  return number;
}

function scrollInlineIntoView(element: HTMLElement) {
  const window = element.ownerDocument.defaultView;
  if (!window) return;
  let current = element.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    const scrollable =
      style.overflowX === "auto" || style.overflowX === "scroll";
    if (
      scrollable &&
      current.clientWidth &&
      current.scrollWidth > current.clientWidth
    ) {
      const scrollerRect = current.getBoundingClientRect();
      const scaleX = scrollerRect.width / current.offsetWidth;
      if (!scaleX) return;
      const scrollPaddingLeft = getPixelValue(
        style.scrollPaddingLeft,
        current.clientWidth,
      );
      const scrollPaddingRight = getPixelValue(
        style.scrollPaddingRight,
        current.clientWidth,
      );
      const viewportStart =
        scrollerRect.left + (current.clientLeft + scrollPaddingLeft) * scaleX;
      const viewportEnd =
        scrollerRect.left +
        (current.clientLeft + current.clientWidth - scrollPaddingRight) *
          scaleX;
      const elementRect = element.getBoundingClientRect();
      const elementStyle = window.getComputedStyle(element);
      const scrollMarginLeft = getPixelValue(
        elementStyle.scrollMarginLeft,
        current.clientWidth,
      );
      const scrollMarginRight = getPixelValue(
        elementStyle.scrollMarginRight,
        current.clientWidth,
      );
      const elementStart = elementRect.left - scrollMarginLeft * scaleX;
      const elementEnd = elementRect.right + scrollMarginRight * scaleX;
      const elementWidth = elementEnd - elementStart;
      const viewportWidth = viewportEnd - viewportStart;
      const before = elementStart < viewportStart;
      const after = elementEnd > viewportEnd;
      let delta = 0;
      if (before && !after) {
        delta =
          elementWidth < viewportWidth
            ? elementStart - viewportStart
            : elementEnd - viewportEnd;
      } else if (after && !before) {
        delta =
          elementWidth < viewportWidth
            ? elementEnd - viewportEnd
            : elementStart - viewportStart;
      }
      current.scrollLeft += delta / scaleX;
    }
    current = current.parentElement;
  }
}

function centerIntoView(element: HTMLElement) {
  const scroller = getVerticalScrollingElement(element);
  if (!scroller) return;
  const window = element.ownerDocument.defaultView;
  if (!window) return;
  const scrollerRect = scroller.getBoundingClientRect();
  const scaleY = scrollerRect.height / scroller.offsetHeight;
  if (!scaleY) return;
  const scrollerStyle = window.getComputedStyle(scroller);
  const scrollPaddingTop = getPixelValue(
    scrollerStyle.scrollPaddingTop,
    scroller.clientHeight,
  );
  const scrollPaddingBottom = getPixelValue(
    scrollerStyle.scrollPaddingBottom,
    scroller.clientHeight,
  );
  const viewportStart =
    scrollerRect.top + (scroller.clientTop + scrollPaddingTop) * scaleY;
  const viewportEnd =
    scrollerRect.top +
    (scroller.clientTop + scroller.clientHeight - scrollPaddingBottom) * scaleY;
  const elementRect = element.getBoundingClientRect();
  const elementStyle = window.getComputedStyle(element);
  const scrollMarginTop = getPixelValue(
    elementStyle.scrollMarginTop,
    scroller.clientHeight,
  );
  const scrollMarginBottom = getPixelValue(
    elementStyle.scrollMarginBottom,
    scroller.clientHeight,
  );
  const elementStart = elementRect.top - scrollMarginTop * scaleY;
  const elementEnd = elementRect.bottom + scrollMarginBottom * scaleY;
  const delta =
    (elementStart + elementEnd - viewportStart - viewportEnd) / 2 / scaleY;
  scroller.scrollTop += delta;
  scrollInlineIntoView(element);
}

export function scrollSelectedItemIntoView(
  store: ComboboxStore,
  element: HTMLElement,
) {
  const { selectElement, selectedValue } = store.getState();
  if (!selectElement) return;
  const value = Array.isArray(selectedValue)
    ? selectedValue.at(-1)
    : selectedValue;
  if (value == null) return;
  if (store.item(element.id)?.value !== value) return;
  withDocumentScrollPreserved(element, () => centerIntoView(element));
}
