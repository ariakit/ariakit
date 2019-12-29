/**
 * Returns `element.ownerDocument || window.document`.
 */
export function getDocument(element?: Element | Document | null): Document {
  return element
    ? element.ownerDocument || (element as Document)
    : window.document;
}
