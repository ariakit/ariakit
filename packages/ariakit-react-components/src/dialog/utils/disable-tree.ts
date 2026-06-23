import { contains, getAllTabbableIn, chain, noop } from "@ariakit/utils";
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
  addElementMarkCleanup,
  restoreCleanups,
} from "./tree-cleanup.ts";
import type { Cleanups, Elements, Ids } from "./tree-cleanup.ts";
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
  cleanups: Cleanups;
  element: Element;
  elements: Elements;
  ids: Ids;
}

function addDisabledElementCleanup({
  cleanups,
  element,
  elements,
  ids,
}: AddDisabledElementCleanupParams) {
  if (isBackdrop(element, ...ids)) return;
  // Ignore focus trap elements connected to any of the dialog elements. See
  // dialog-menu "move back to menu button with Shift+Tab" test.
  if (isFocusTrap(element, ...ids)) return;
  cleanups.push(disableTree(element, elements));
}

function addRoleNoneCleanup(
  cleanups: Cleanups,
  ancestor: Element,
  elements: Elements,
) {
  // Parent accessible elements that are not part of the modal context should
  // have their role set to "none" so that they are not exposed to screen
  // readers.
  if (!ancestor.hasAttribute("role")) return;
  if (elements.some((el) => el && contains(el, ancestor))) return;
  cleanups.push(setAttribute(ancestor, "role", "none"));
}

export function disableTreeOutside(id: string, elements: Elements) {
  const cleanups: Array<() => void> = [];
  const ids = elements.map((el) => el?.id);

  walkTreeOutside(
    id,
    elements,
    (element) => {
      addDisabledElementCleanup({ cleanups, element, elements, ids });
    },
    (ancestor) => {
      addRoleNoneCleanup(cleanups, ancestor, elements);
    },
  );

  const restoreTreeOutside = () => {
    restoreCleanups(cleanups);
  };

  return restoreTreeOutside;
}

// Marks and disables the element tree outside the dialog in a single walk.
// Modal dialogs always need both markTreeOutside and disableTreeOutside, so
// this combines their callbacks to avoid walking the tree twice on open.
export function markAndDisableTreeOutside(id: string, elements: Elements) {
  const cleanups: Array<() => void> = [];
  const ids = elements.map((el) => el?.id);

  walkTreeOutside(
    id,
    elements,
    (element) => {
      addElementMarkCleanup({ cleanups, element, id, ids });
      addDisabledElementCleanup({ cleanups, element, elements, ids });
    },
    (ancestor, element) => {
      addAncestorMarkCleanup({ cleanups, ancestor, element, id });
      addRoleNoneCleanup(cleanups, ancestor, elements);
    },
  );

  const restoreTreeOutside = () => {
    restoreCleanups(cleanups);
  };

  return restoreTreeOutside;
}
