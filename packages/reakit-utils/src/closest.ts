// closest ponyfill

function matches(element: Element, selectors: string): boolean {
  if ("matches" in element) return element.matches(selectors);
  if ("msMatchesSelector" in element)
    return (element as any).msMatchesSelector(selectors);
  return (element as any).webkitMatchesSelector(selectors);
}

export function closest<K extends keyof HTMLElementTagNameMap>(
  element: Element,
  selectors: K
): HTMLElementTagNameMap[K];

export function closest<K extends keyof SVGElementTagNameMap>(
  element: Element,
  selectors: K
): SVGElementTagNameMap[K];

export function closest<T extends Element = Element>(
  element: Element,
  selectors: string
): T | null;

export function closest(element: Element, selectors: string) {
  if ("closest" in element) return element.closest(selectors);
  do {
    if (matches(element, selectors)) return element;
    element = (element.parentElement || element.parentNode) as any;
  } while (element !== null && element.nodeType === 1);
  return null;
}
