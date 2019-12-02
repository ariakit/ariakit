import { getDocument } from "./getDocument";

export function hasFocusWithin(element: Element) {
  const document = getDocument(element);
  if (!document.activeElement) return false;
  return element.contains(document.activeElement);
}
