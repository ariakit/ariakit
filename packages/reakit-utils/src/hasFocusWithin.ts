export function hasFocusWithin(element: Element) {
  const doc = element.ownerDocument || document;
  if (!doc.activeElement) return false;
  return element.contains(doc.activeElement);
}
