import { chain } from "@ariakit/utils";
import { isBackdrop } from "./is-backdrop.ts";
import { setProperty } from "./orchestrate.ts";
import { walkTreeOutside } from "./walk-tree-outside.ts";

type Elements = Array<Element | null>;

function getPropertyName(id = "", ancestor = false) {
  return `__ariakit-dialog-${ancestor ? "ancestor" : "outside"}${
    id ? `-${id}` : ""
  }` as keyof Element;
}

export function markElement(element: Element, id = "") {
  return chain(
    setProperty(element, getPropertyName(), true),
    setProperty(element, getPropertyName(id), true),
  );
}

export function markAncestor(element: Element, id = "") {
  return chain(
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
    // oxlint-disable-next-line no-constant-condition
  } while (true);
}

export function markTreeOutside(id: string, elements: Elements) {
  const cleanups: Array<() => void> = [];
  const ids = elements.map((el) => el?.id);

  walkTreeOutside(
    id,
    elements,
    (element) => {
      if (isBackdrop(element, ...ids)) return;
      cleanups.push(markElement(element, id));
    },
    (ancestor, element) => {
      // See https://github.com/ariakit/ariakit/issues/2687
      const isAnotherDialogAncestor =
        element.hasAttribute("data-dialog") && element.id !== id;
      if (isAnotherDialogAncestor) return;
      cleanups.push(markAncestor(ancestor, id));
    },
  );

  const restoreAccessibilityTree = () => {
    // Run in reverse so the most recently marked elements restore first,
    // matching the previous unshift-based order without its O(n²) cost.
    for (let index = cleanups.length - 1; index >= 0; index -= 1) {
      cleanups[index]?.();
    }
  };

  return restoreAccessibilityTree;
}
