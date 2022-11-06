import { contains, getDocument } from "ariakit-utils/dom";

type Elements = Array<Element | null>;

// We don't need to walk through certain tags.
const ignoreTags = ["SCRIPT", "STYLE"];

export function isValidElement(element: Element, ignoredElements: Elements) {
  if (ignoreTags.includes(element.tagName)) return false;
  return !ignoredElements.some(
    (enabledElement) => enabledElement && contains(element, enabledElement)
  );
}

export function walkTreeOutside(
  elements: Elements,
  callback: (element: Element) => void
) {
  for (let element of elements) {
    const document = getDocument(element);
    // Loops through the parent elements and then through each of their
    // children.
    while (element?.parentElement && element !== document.body) {
      for (const child of element.parentElement.children) {
        if (isValidElement(child, elements)) {
          callback(child);
        }
      }
      element = element.parentElement;
    }
  }
}
