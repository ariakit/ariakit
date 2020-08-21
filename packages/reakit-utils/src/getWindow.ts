import { getDocument } from "./getDocument";

/**
 * Returns `element.ownerDocument.defaultView || window`.
 */
export function getWindow(element?: Element): Window {
  return getDocument(element).defaultView || window;
}
