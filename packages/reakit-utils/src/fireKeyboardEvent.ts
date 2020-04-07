import { createKeyboardEvent } from "./createKeyboardEvent";

/**
 * Creates and dispatches `KeyboardEvent` in a way that also works on IE 11.
 *
 * @example
 * import { fireKeyboardEvent } from "reakit-utils";
 *
 * fireKeyboardEvent(document.getElementById("id"), "keydown", {
 *   key: "ArrowDown",
 *   shiftKey: true,
 * });
 */
export function fireKeyboardEvent(
  element: HTMLElement,
  type: string,
  eventInit: KeyboardEventInit
) {
  return element.dispatchEvent(createKeyboardEvent(element, type, eventInit));
}
