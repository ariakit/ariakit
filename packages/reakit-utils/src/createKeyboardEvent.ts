import { getDocument } from "./getDocument";
import { getDefaultView } from "./getDefaultView";

/**
 * Creates a `KeyboardEvent` in a way that also works on IE 11.
 *
 * @example
 * import { createKeyboardEvent } from "reakit-utils";
 *
 * const el = document.getElementById("id");
 * el.dispatchEvent(createKeyboardEvent(el, "keydown", { key: "ArrowDown" }));
 */
export function createKeyboardEvent(
  element: HTMLElement,
  type: string,
  eventInit: KeyboardEventInit = {}
): KeyboardEvent {
  if (typeof KeyboardEvent === "function") {
    return new KeyboardEvent(type, eventInit);
  }
  // IE 11 doesn't support Event constructors
  const event = getDocument(element).createEvent("KeyboardEvent");
  (event as any).initKeyboardEvent(
    type,
    eventInit.bubbles,
    eventInit.cancelable,
    getDefaultView(element),
    eventInit.key,
    eventInit.location,
    eventInit.ctrlKey,
    eventInit.altKey,
    eventInit.shiftKey,
    eventInit.metaKey
  );
  return event;
}
