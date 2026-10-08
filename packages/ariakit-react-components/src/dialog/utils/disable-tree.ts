import { contains, getAllTabbableIn, chain, noop } from "@ariakit/utils";
import { isHiddenDismiss } from "./__is-hidden-dismiss.ts";
import { hideElementFromAccessibilityTree } from "./disable-accessibility-tree-outside.ts";
import { isBackdrop } from "./is-backdrop.ts";
import { isFocusTrap } from "./is-focus-trap.ts";
import {
  assignStyle,
  orchestrate,
  setAttribute,
  setProperty,
} from "./orchestrate.ts";
import { supportsInert } from "./supports-inert.ts";
import {
  addAncestorMarkCleanup,
  addCleanup,
  addElementMarkCleanup,
  finishCleanupWalk,
  restoreCleanups,
  startCleanupWalk,
} from "./tree-cleanup.ts";
import type { CleanupWalk, Cleanups, Elements, Ids } from "./tree-cleanup.ts";
import { walkTreeOutside } from "./walk-tree-outside.ts";

export function disableTree(
  element: Element | HTMLElement,
  ignoredElements?: Elements,
) {
  if (!("style" in element)) return noop;

  if (supportsInert()) {
    return setProperty(element, "inert", true);
  }

  const tabbableElements = getAllTabbableIn(element, true);
  const enableElements = tabbableElements.map((element) => {
    if (ignoredElements?.some((el) => el && contains(el, element))) return noop;
    const restoreFocusMethod = orchestrate(element, "focus", () => {
      element.focus = noop;
      return () => {
        // @ts-expect-error Delete focus method to restore original behavior
        delete element.focus;
      };
    });
    return chain(setAttribute(element, "tabindex", "-1"), restoreFocusMethod);
  });

  return chain(
    ...enableElements,
    hideElementFromAccessibilityTree(element),
    assignStyle(element, {
      pointerEvents: "none",
      userSelect: "none",
      cursor: "default",
    }),
  );
}

interface AddDisabledElementCleanupParams {
  walk: CleanupWalk;
  element: Element;
  elements: Elements;
  ids: Ids;
}

function addDisabledElementCleanup({
  walk,
  element,
  elements,
  ids,
}: AddDisabledElementCleanupParams) {
  if (isBackdrop(element, ...ids)) return;
  // Ignore focus trap elements connected to any of the dialog elements. See
  // dialog-menu "move back to menu button with Shift+Tab" test.
  if (isFocusTrap(element, ...ids)) return;
  // The hidden dismiss button renders next to the dialog, so it has to stay
  // operable for the assistive technology users it exists for. A dialog reaches
  // its own button here when the button is in its tree snapshot. The snapshot
  // taken on open predates the button, but a new snapshot has it, and so does
  // an element of the snapshot that the dialog moves into, such as when the
  // dialog moves out of a portal.
  // https://github.com/ariakit/ariakit/issues/7310
  if (isHiddenDismiss(element, ...ids)) return;
  addCleanup({
    walk,
    element,
    kind: "disable",
    setup: () => disableTree(element, elements),
  });
}

function addRoleNoneCleanup(
  walk: CleanupWalk,
  ancestor: Element,
  elements: Elements,
) {
  // Parent accessible elements that are not part of the modal context should
  // have their role set to "none" so that they are not exposed to screen
  // readers.
  if (!ancestor.hasAttribute("role")) return;
  if (elements.some((el) => el && contains(el, ancestor))) return;
  addCleanup({
    walk,
    element: ancestor,
    kind: "role",
    setup: () => setAttribute(ancestor, "role", "none"),
  });
}

// Marks and disables the element tree outside the dialog in a single walk.
// Modal dialogs always need both marking and disabling outside elements, so
// this combines their callbacks to avoid walking the tree twice on open.
//
// With `previousCleanups`, the elements that stay disabled are not touched.
// Each `inert` change invalidates the style of the whole subtree, so restoring
// and disabling the same elements again is expensive on large pages.
// https://github.com/ariakit/ariakit/issues/7697
export function markAndDisableTreeOutside(
  id: string,
  elements: Elements,
  previousCleanups?: Cleanups,
) {
  // TODO: Remove this when all supported browsers have `inert`. Without it,
  // `disableTree` disables only the elements that are tabbable at that time, so
  // the walk must disable the whole tree again.
  if (previousCleanups && !supportsInert()) {
    restoreCleanups(previousCleanups);
  }
  const walk = startCleanupWalk(previousCleanups);
  const ids = elements.map((el) => el?.id);

  walkTreeOutside(
    id,
    elements,
    (element) => {
      addElementMarkCleanup({ walk, element, id, ids });
      addDisabledElementCleanup({ walk, element, elements, ids });
    },
    (ancestor, element) => {
      addAncestorMarkCleanup({ walk, ancestor, element, id });
      addRoleNoneCleanup(walk, ancestor, elements);
    },
  );

  // This synchronously restores the elements that are no longer outside, so
  // that they can receive focus in the same commit.
  return finishCleanupWalk(walk);
}
