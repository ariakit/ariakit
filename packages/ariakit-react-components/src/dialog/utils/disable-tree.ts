import { contains, getAllTabbableIn, chain, noop } from "@ariakit/utils";
import { hideElementFromAccessibilityTree } from "./disable-accessibility-tree-outside.ts";
import { isBackdrop } from "./is-backdrop.ts";
import { isFocusTrap } from "./is-focus-trap.ts";
import { markAncestor, markElement } from "./mark-tree-outside.ts";
import {
  assignStyle,
  orchestrate,
  setAttribute,
  setProperty,
} from "./orchestrate.ts";
import { supportsInert } from "./supports-inert.ts";
import { walkTreeOutside } from "./walk-tree-outside.ts";

type Elements = Array<Element | null>;

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

export function disableTreeOutside(id: string, elements: Elements) {
  const cleanups: Array<() => void> = [];
  const ids = elements.map((el) => el?.id);

  walkTreeOutside(
    id,
    elements,
    (element) => {
      if (isBackdrop(element, ...ids)) return;
      // Ignore focus trap elements connected to any of the dialog elements. See
      // dialog-menu "move back to menu button with Shift+Tab" test.
      if (isFocusTrap(element, ...ids)) return;
      cleanups.push(disableTree(element, elements));
    },
    (ancestor) => {
      // Parent accessible elements that are not part of the modal context
      // should have their role set to "none" so that they are not exposed to
      // screen readers.
      if (!ancestor.hasAttribute("role")) return;
      if (elements.some((el) => el && contains(el, ancestor))) return;
      cleanups.push(setAttribute(ancestor, "role", "none"));
    },
  );

  const restoreTreeOutside = () => {
    // Run in reverse so the most recently set properties restore first,
    // matching the previous unshift-based order without its O(n²) cost.
    for (let index = cleanups.length - 1; index >= 0; index -= 1) {
      cleanups[index]?.();
    }
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
      if (isBackdrop(element, ...ids)) return;
      cleanups.push(markElement(element, id));
      // Ignore focus trap elements connected to any of the dialog elements. See
      // dialog-menu "move back to menu button with Shift+Tab" test.
      if (isFocusTrap(element, ...ids)) return;
      cleanups.push(disableTree(element, elements));
    },
    (ancestor, element) => {
      // See https://github.com/ariakit/ariakit/issues/2687
      const isAnotherDialogAncestor =
        element.hasAttribute("data-dialog") && element.id !== id;
      if (!isAnotherDialogAncestor) {
        cleanups.push(markAncestor(ancestor, id));
      }
      // Parent accessible elements that are not part of the modal context
      // should have their role set to "none" so that they are not exposed to
      // screen readers.
      if (!ancestor.hasAttribute("role")) return;
      if (elements.some((el) => el && contains(el, ancestor))) return;
      cleanups.push(setAttribute(ancestor, "role", "none"));
    },
  );

  const restoreTreeOutside = () => {
    // Run in reverse so the most recently set properties restore first,
    // matching the previous unshift-based order without its O(n²) cost.
    for (let index = cleanups.length - 1; index >= 0; index -= 1) {
      cleanups[index]?.();
    }
  };

  return restoreTreeOutside;
}
