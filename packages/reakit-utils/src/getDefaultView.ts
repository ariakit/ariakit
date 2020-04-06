import { getDocument } from "./getDocument";

/**
 * Returns `element.ownerDocument.defaultView || window`.
 */
export function getDefaultView(element?: Element): Window {
  return getDocument(element).defaultView || window;
}
