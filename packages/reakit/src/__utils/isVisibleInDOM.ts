export function isVisibleInDOM(element: Element) {
  return (element as HTMLElement).offsetParent != null;
}
