import { setAttribute } from "./orchestrate.js";
import { walkTreeOutside } from "./walk-tree-outside.js";

type Elements = Array<Element | null>;

export function hideElementFromAccessibilityTree(element: Element) {
  return setAttribute(element, "aria-hidden", "true");
}

export function disableAccessibilityTreeOutside(...elements: Elements) {
  const cleanups: Array<() => void> = [];

  walkTreeOutside(elements, (element) => {
    cleanups.unshift(hideElementFromAccessibilityTree(element));
  });

  const restoreAccessibilityTree = () => {
    cleanups.forEach((fn) => fn());
  };

  return restoreAccessibilityTree;
}
