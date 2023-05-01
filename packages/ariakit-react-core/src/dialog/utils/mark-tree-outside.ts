import { chain } from "@ariakit/core/utils/misc";
import { setProperty } from "./orchestrate.js";
import { walkTreeOutside } from "./walk-tree-outside.js";

type Elements = Array<Element | null>;

function getPropertyName(id = "", ancestor = false) {
  return `__ariakit-dialog-${ancestor ? "ancestor" : "outside"}${
    id ? `-${id}` : ""
  }` as keyof Element;
}

export function markElement(element: Element, id = "") {
  return chain(
    setProperty(element, getPropertyName(), true),
    setProperty(element, getPropertyName(id), true)
  );
}

export function markAncestor(element: Element, id = "") {
  return chain(
    setProperty(element, getPropertyName("", true), true),
    setProperty(element, getPropertyName(id, true), true)
  );
}

export function isElementMarked(element: Element, id?: string) {
  const ancestorProperty = getPropertyName(id, true);
  if (element[ancestorProperty]) return true;
  const elementProperty = getPropertyName(id);
  do {
    if (element[elementProperty]) return true;
    if (!element.parentElement) return false;
    element = element.parentElement;
  } while (true);
}

export function markTreeOutside(dialogId: string, ...elements: Elements) {
  const cleanups: Array<() => void> = [];

  walkTreeOutside(
    elements,
    (element) => cleanups.unshift(markElement(element, dialogId)),
    (ancestor) => cleanups.unshift(markAncestor(ancestor, dialogId))
  );

  const restoreAccessibilityTree = () => {
    cleanups.forEach((fn) => fn());
  };

  return restoreAccessibilityTree;
}
