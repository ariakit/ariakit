import {
  addAncestorMarkCleanup,
  addElementMarkCleanup,
  finishCleanupWalk,
  startCleanupWalk,
} from "./tree-cleanup.ts";
import type { Cleanups, Elements } from "./tree-cleanup.ts";
import { walkTreeOutside } from "./walk-tree-outside.ts";
export {
  isElementInside,
  isElementMarked,
  markAncestor,
  markElement,
  markTreeInside,
} from "./tree-cleanup.ts";

// Marks the element tree outside the dialog. With `previousCleanups`, the
// function keeps the marks that still apply and restores only the other ones.
export function markTreeOutside(
  id: string,
  elements: Elements,
  previousCleanups?: Cleanups,
) {
  const walk = startCleanupWalk(previousCleanups);
  const ids = elements.map((el) => el?.id);

  walkTreeOutside(
    id,
    elements,
    (element) => {
      addElementMarkCleanup({ walk, element, id, ids });
    },
    (ancestor, element) => {
      addAncestorMarkCleanup({ walk, ancestor, element, id });
    },
  );

  return finishCleanupWalk(walk);
}
