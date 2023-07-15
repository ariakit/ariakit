import { contains } from "@ariakit/core/utils/dom";
import { getAllTabbable } from "@ariakit/core/utils/focus";
import { chain, noop } from "@ariakit/core/utils/misc";
import { hideElementFromAccessibilityTree } from "./disable-accessibility-tree-outside.js";
import { isBackdrop } from "./is-backdrop.js";
import { assignStyle, setAttribute, setProperty } from "./orchestrate.js";
import { supportsInert } from "./supports-inert.js";
import { walkTreeOutside } from "./walk-tree-outside.js";

type Elements = Array<Element | null>;

function disableElement(element: Element | HTMLElement) {
  if (!("style" in element)) return noop;

  if (supportsInert()) {
    return setProperty(element, "inert", true);
  }

  return chain(
    hideElementFromAccessibilityTree(element),
    assignStyle(element, {
      pointerEvents: "none",
      userSelect: "none",
      cursor: "default",
    }),
  );
}

export function disableTreeOutside(...elements: Elements) {
  const cleanups: Array<() => void> = [];
  const ids = elements.map((el) => el?.id);

  // If the browser doesn't support the inert attribute, we need to manually
  // disable all tabbable elements outside the dialog.
  if (!supportsInert()) {
    getAllTabbable().forEach((element) => {
      // Ignore tabbable elements inside the dialog
      if (elements.some((el) => el && contains(el, element))) return;
      cleanups.unshift(setAttribute(element, "tabindex", "-1"));
    });
  }

  walkTreeOutside(elements, (element) => {
    if (isBackdrop(element, ...ids)) return;
    cleanups.unshift(disableElement(element));
  });

  const restoreTreeOutside = () => {
    cleanups.forEach((fn) => fn());
  };

  return restoreTreeOutside;
}
