import { contains } from "@ariakit/core/utils/dom";
import { getAllTabbableIn } from "@ariakit/core/utils/focus";
import { chain, noop } from "@ariakit/core/utils/misc";
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
      cleanups.unshift(disableTree(element, elements));
    },
    (element) => {
      // Parent accessible elements that are not part of the modal context
      // should have their role set to "none" so that they are not exposed to
      // screen readers.
      if (!element.hasAttribute("role")) return;
      if (elements.some((el) => el && contains(el, element))) return;
      cleanups.unshift(setAttribute(element, "role", "none"));
    },
  );

  const restoreTreeOutside = () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };

  return restoreTreeOutside;
}
