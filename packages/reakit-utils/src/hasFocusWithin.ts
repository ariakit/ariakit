export function hasFocusWithin(element: Element) {
  if (!document.activeElement) return false;
  return element.contains(document.activeElement);
}
