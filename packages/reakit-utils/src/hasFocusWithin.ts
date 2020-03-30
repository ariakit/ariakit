import { getActiveElement } from "./getActiveElement";

/**
 * Checks if `element` has focus.
 *
 * @example
 * import { hasFocusWithin } from "reakit-utils";
 *
 * hasFocusWithin(document.getElementById("id"));
 */
export function hasFocusWithin(element: Element): boolean {
  const activeElement = getActiveElement(element);
  if (!activeElement) return false;
  if (element.contains(activeElement)) return true;
  const activeDescendant = activeElement.getAttribute("aria-activedescendant");
  if (!activeDescendant) return false;
  return (
    activeDescendant === element.id ||
    !!element.querySelector(`#${activeDescendant}`)
  );
}
