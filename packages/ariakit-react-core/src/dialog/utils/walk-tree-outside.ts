import { contains, getDocument } from "@ariakit/core/utils/dom";

type Elements = Array<Element | null>;

// We don't need to walk through certain tags.
const ignoreTags = ["SCRIPT", "STYLE"];

export function isValidElement(element: Element, ignoredElements: Elements) {
  if (ignoreTags.includes(element.tagName)) return false;
  return !ignoredElements.some(
    (enabledElement) => enabledElement && contains(element, enabledElement),
  );
}

export function walkTreeOutside(
  elements: Elements,
  callback: (element: Element, originalElement: Element) => void,
  ancestorCallback?: (element: Element, originalElement: Element) => void,
) {
  for (let element of elements) {
    if (!element?.isConnected) continue;
    // If the element has already an ancestor element in the list, we skip it.
    const hasAncestorAlready = elements.some((maybeAncestor) => {
      if (!maybeAncestor) return false;
      if (maybeAncestor === element) return false;
      return maybeAncestor.contains(element);
    });
    const doc = getDocument(element);
    const originalElement = element;
    // Loops through the parent elements and then through each of their
    // children.
    while (element.parentElement && element !== doc.body) {
      ancestorCallback?.(element.parentElement, originalElement);
      if (!hasAncestorAlready) {
        for (const child of element.parentElement.children) {
          if (isValidElement(child, elements)) {
            callback(child, originalElement);
          }
        }
      }
      element = element.parentElement;
    }
  }
}
