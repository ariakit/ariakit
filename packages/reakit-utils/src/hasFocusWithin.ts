import { getDocument } from "./getDocument";

/**
 * Checks if `element` has focus.
 *
 * @example
 * import { hasFocusWithin } from "reakit-utils";
 *
 * hasFocusWithin(document.getElementById("id"));
 */
export function hasFocusWithin(element: Element): boolean {
  const document = getDocument(element);
  if (!document.activeElement) return false;
  return element.contains(document.activeElement);
}
