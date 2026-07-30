import { getScrollingElement } from "@ariakit/utils";
import { withDocumentScrollPreserved } from "../composite/utils.ts";
import type { ComboboxStore } from "./combobox-store.ts";

function getOffset(element: HTMLElement, horizontal = false) {
  let offset = 0;
  let current: HTMLElement | null = element;
  while (current) {
    offset += horizontal ? current.offsetLeft : current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
    if (current) {
      offset += horizontal ? current.clientLeft : current.clientTop;
    }
  }
  return offset;
}

function scrollInlineIntoView(element: HTMLElement, scroller: HTMLElement) {
  const scrollerRect = scroller.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const scale = scrollerRect.width / scroller.offsetWidth;
  if (!scale) return;
  const start = scrollerRect.left + scroller.clientLeft * scale;
  const end = start + scroller.clientWidth * scale;
  const before = elementRect.left < start;
  const after = elementRect.right > end;
  if (before === after) return;
  const delta = before ? elementRect.left - start : elementRect.right - end;
  scroller.scrollLeft += delta / scale;
}

function centerIntoView(element: HTMLElement) {
  const scroller = getScrollingElement(element);
  if (!scroller) return;
  const HTMLElementClass = element.ownerDocument.defaultView?.HTMLElement;
  if (!HTMLElementClass) return;
  if (!(scroller instanceof HTMLElementClass)) return;
  scrollInlineIntoView(element, scroller);
  const elementCenter = getOffset(element) + element.offsetHeight / 2;
  const scrollerCenter =
    getOffset(scroller) + scroller.clientTop + scroller.clientHeight / 2;
  scroller.scrollTop = elementCenter - scrollerCenter;
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
