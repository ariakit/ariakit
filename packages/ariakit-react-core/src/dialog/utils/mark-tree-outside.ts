import { chain } from "@ariakit/core/utils/misc";
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
    // biome-ignore lint/correctness/noConstantCondition: Intentional infinite loop with break condition
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
      cleanups.unshift(markElement(element, id));
    },
    (ancestor, element) => {
      // See https://github.com/ariakit/ariakit/issues/2687
      const isAnotherDialogAncestor =
        element.hasAttribute("data-dialog") && element.id !== id;
      if (isAnotherDialogAncestor) return;
      cleanups.unshift(markAncestor(ancestor, id));
    },
  );

  const restoreAccessibilityTree = () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };

  return restoreAccessibilityTree;
}
