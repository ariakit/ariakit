export function getDocument(element?: Element | Document | null) {
  return element
    ? element.ownerDocument || (element as Document)
    : window.document;
}
