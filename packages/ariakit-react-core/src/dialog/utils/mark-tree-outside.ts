import { closest } from "@ariakit/core/utils/dom";
import { setObservableAttribute } from "./set-observable.js";
import { walkTreeOutside } from "./walk-tree-outside.js";

type Elements = Array<Element | null>;

export function markElement(element: Element) {
  return setObservableAttribute(element, "data-dialog-outside", "");
}

export function isElementMarked(element: Element) {
  return !!closest(element, "[data-dialog-outside]");
}

export function markTreeOutside(...elements: Elements) {
  const cleanups: Array<() => void> = [];

  walkTreeOutside(elements, (element) => {
    cleanups.unshift(markElement(element));
  });

  const restoreAccessibilityTree = () => {
    cleanups.forEach((fn) => fn());
  };

  return restoreAccessibilityTree;
}
