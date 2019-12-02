export function getDocument(element?: Element | Document) {
  return element
    ? element.ownerDocument || (element as Document)
    : window.document;
}
