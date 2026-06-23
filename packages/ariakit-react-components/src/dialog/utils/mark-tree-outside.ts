import {
  addAncestorMarkCleanup,
  addElementMarkCleanup,
  restoreCleanups,
} from "./tree-cleanup.ts";
import type { Elements } from "./tree-cleanup.ts";
import { walkTreeOutside } from "./walk-tree-outside.ts";
export { isElementMarked, markAncestor, markElement } from "./tree-cleanup.ts";

export function markTreeOutside(id: string, elements: Elements) {
  const cleanups: Array<() => void> = [];
  const ids = elements.map((el) => el?.id);

  walkTreeOutside(
    id,
    elements,
    (element) => {
      addElementMarkCleanup({ cleanups, element, id, ids });
    },
    (ancestor, element) => {
      addAncestorMarkCleanup({ cleanups, ancestor, element, id });
    },
  );

  const restoreAccessibilityTree = () => {
    restoreCleanups(cleanups);
  };

  return restoreAccessibilityTree;
}
