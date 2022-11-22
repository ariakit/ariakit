import { walkTreeOutside } from "./walk-tree-outside";

type Elements = Array<Element | null>;

function disableElement(element: Element) {
  const previousAriaHidden = element.getAttribute("aria-hidden") || "";
  element.setAttribute("aria-hidden", "true");
  const enableElement = () => {
    if (previousAriaHidden) {
      element.setAttribute("aria-hidden", previousAriaHidden);
    } else {
      element.removeAttribute("aria-hidden");
    }
  };
  return enableElement;
}

export function disableAccessibilityTreeOutside(...elements: Elements) {
  const cleanups: Array<() => void> = [];

  walkTreeOutside(elements, (element) => {
    cleanups.unshift(disableElement(element));
  });

  const restoreAccessibilityTree = () => {
    cleanups.forEach((fn) => fn());
  };

  return restoreAccessibilityTree;
}
