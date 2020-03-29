import { getActiveElement } from "./getActiveElement";

/**
 * Checks if `element` has focus.
 *
 * @example
 * import { hasFocus } from "reakit-utils";
 *
 * hasFocus(document.getElementById("id"));
 */
export function hasFocus(element: Element): boolean {
  const activeElement = getActiveElement(element);
  if (!activeElement) return false;
  if (element === activeElement) return true;
  const activeDescendant = activeElement.getAttribute("aria-activedescendant");
  if (!activeDescendant) return false;
  return activeDescendant === element.id;
}
