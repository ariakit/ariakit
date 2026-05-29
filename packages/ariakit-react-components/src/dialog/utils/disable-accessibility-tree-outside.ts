import { isBackdrop } from "./is-backdrop.ts";
import { setAttribute } from "./orchestrate.ts";
import { walkTreeOutside } from "./walk-tree-outside.ts";

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
    for (const cleanup of cleanups) {
      cleanup();
    }
  };

  return restoreAccessibilityTree;
}
