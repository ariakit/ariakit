import { contains } from "@ariakit/core/utils/dom";
import { getAllTabbableIn } from "@ariakit/core/utils/focus";
import { chain, noop } from "@ariakit/core/utils/misc";
import { hideElementFromAccessibilityTree } from "./disable-accessibility-tree-outside.js";
import { isBackdrop } from "./is-backdrop.js";
import { assignStyle, setAttribute, setProperty } from "./orchestrate.js";
import { supportsInert } from "./supports-inert.js";
import { walkTreeOutside } from "./walk-tree-outside.js";

type Elements = Array<Element | null>;

export function disableTree(
  element: Element | HTMLElement,
  ignoredElements?: Elements,
) {
  if (!("style" in element)) return noop;

  if (supportsInert()) {
    return setProperty(element, "inert", true);
  }

  const tabbableElements = getAllTabbableIn(element);
  const enableElements = tabbableElements.map((element) => {
    if (ignoredElements?.some((el) => el && contains(el, element))) return noop;
    return setAttribute(element, "tabindex", "-1");
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

  walkTreeOutside(id, elements, (element) => {
    if (isBackdrop(element, ...ids)) return;
    cleanups.unshift(disableTree(element, elements));
  });

  const restoreTreeOutside = () => {
    cleanups.forEach((fn) => fn());
  };

  return restoreTreeOutside;
}
