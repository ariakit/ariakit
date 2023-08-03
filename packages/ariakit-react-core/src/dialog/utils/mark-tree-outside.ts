import { chain } from "@ariakit/core/utils/misc";
import { isBackdrop } from "./is-backdrop.js";
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
    // Debug
    // setAttribute(element, getPropertyName(), "true"),
    // setAttribute(element, getPropertyName(id), "true"),
    setProperty(element, getPropertyName(), true),
    setProperty(element, getPropertyName(id), true),
  );
}

export function markAncestor(element: Element, id = "") {
  return chain(
    // Debug
    // setAttribute(element, getPropertyName("", true), "true"),
    // setAttribute(element, getPropertyName(id, true), "true"),
    setProperty(element, getPropertyName("", true), true),
    setProperty(element, getPropertyName(id, true), true),
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
  const ids = elements.map((el) => el?.id);

  walkTreeOutside(
    elements,
    (element) => {
      if (isBackdrop(element, ...ids)) return;
      cleanups.unshift(markElement(element, dialogId));
    },
    (ancestor, element) => {
      // See https://github.com/ariakit/ariakit/issues/2687
      const isAnotherDialogAncestor =
        element.hasAttribute("data-dialog") && element.id !== dialogId;
      if (isAnotherDialogAncestor) return;
      cleanups.unshift(markAncestor(ancestor, dialogId));
    },
  );

  const restoreAccessibilityTree = () => {
    cleanups.forEach((fn) => fn());
  };

  return restoreAccessibilityTree;
}
