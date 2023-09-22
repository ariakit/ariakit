import { isBackdrop } from "./is-backdrop.js";
import { setAttribute } from "./orchestrate.js";
import { walkTreeOutside } from "./walk-tree-outside.js";

type Elements = Array<Element | null>;

export function hideElementFromAccessibilityTree(element: Element) {
  return setAttribute(element, "aria-hidden", "true");
}

export function disableAccessibilityTreeOutside(
  id: string,
  elements: Elements,
) {
  const cleanups: Array<() => void> = [];
  const ids = elements.map((el) => el?.id);

  walkTreeOutside(id, elements, (element) => {
    if (isBackdrop(element, ...ids)) return;
    cleanups.unshift(hideElementFromAccessibilityTree(element));
  });

  const restoreAccessibilityTree = () => {
    cleanups.forEach((fn) => fn());
  };

  return restoreAccessibilityTree;
}
