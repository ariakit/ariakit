import { getDocument } from "./getDocument";

/**
 * Returns `element.ownerDocument.activeElement`.
 */
export function getActiveElement(element?: Element | Document | null) {
  return getDocument(element).activeElement;
}
