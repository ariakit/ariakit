import { FocusEvent as ReactFocusEvent, SyntheticEvent } from "react";
import {
  canUseDOM,
  contains,
  getDocument,
  getWindow,
  getActiveElement,
} from "./dom";

/**
 * Returns `true` if `event` has been fired within a React Portal element.
 */
export function isPortalEvent(event: SyntheticEvent): boolean {
  return !contains(event.currentTarget, event.target as Element);
}

/**
 * Returns `true` if `event.target` and `event.currentTarget` are the same.
 */
export function isSelfTarget(event: SyntheticEvent): boolean {
  return event.target === event.currentTarget;
}

/**
 * Creates an event. Supports IE 11.
 *
 * @example
 * import { createEvent } from "reakit-utils";
 *
 * const element = document.getElementById("id");
 * createEvent(element, "blur", { bubbles: false });
 */
export function createEvent(
  element: HTMLElement,
  type: string,
  eventInit?: EventInit
): Event {
  if (typeof Event === "function") {
    return new Event(type, eventInit);
  }
  // IE 11 doesn't support Event constructors
  const event = getDocument(element).createEvent("Event");
  event.initEvent(type, eventInit?.bubbles, eventInit?.cancelable);
  return event;
}

/**
 * Creates and dispatches an event. Supports IE 11.
 *
 * @example
 * import { fireEvent } from "reakit-utils";
 *
 * fireEvent(document.getElementById("id"), "blur", {
 *   bubbles: true,
 *   cancelable: true,
 * });
 */
export function fireEvent(
  element: HTMLElement,
  type: string,
  eventInit: EventInit
) {
  return element.dispatchEvent(createEvent(element, type, eventInit));
}

/**
 * Creates and dispatches a blur event. Supports IE 11.
 *
 * @example
 * import { fireBlurEvent } from "reakit-utils";
 *
 * fireBlurEvent(document.getElementById("id"));
 */
export function fireBlurEvent(
  element: HTMLElement,
  eventInit?: FocusEventInit
) {
  const event = createFocusEvent(element, "blur", eventInit);
  const defaultAllowed = element.dispatchEvent(event);
  const bubbleInit = { ...eventInit, bubbles: true };
  element.dispatchEvent(createFocusEvent(element, "focusout", bubbleInit));
  return defaultAllowed;
}

function createFocusEvent(
  element: HTMLElement,
  type: string,
  eventInit: FocusEventInit = {}
): Event {
  if (typeof FocusEvent === "function") {
    return new FocusEvent(type, eventInit);
  }
  return createEvent(element, type, eventInit);
}

/**
 * Creates and dispatches a keyboard event. Supports IE 11.
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

function createKeyboardEvent(
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
    getWindow(element),
    eventInit.key,
    eventInit.location,
    eventInit.ctrlKey,
    eventInit.altKey,
    eventInit.shiftKey,
    eventInit.metaKey
  );
  return event;
}

/**
 * Cross-browser method that returns the next active element (the element that
 * is receiving focus) after a blur event is dispatched. It receives the blur
 * event object as the argument.
 *
 * @example
 * import { getNextActiveElementOnBlur } from "reakit-utils";
 *
 * const element = document.getElementById("id");
 * element.addEventListener("blur", (event) => {
 *   const nextActiveElement = getNextActiveElementOnBlur(event);
 * });
 */
export function getNextActiveElementOnBlur(
  event: ReactFocusEvent | FocusEvent
) {
  const isIE11 = canUseDOM && "msCrypto" in window;
  // IE 11 doesn't support event.relatedTarget on blur.
  // document.activeElement points the the next active element.
  // On modern browsers, document.activeElement points to the current target.
  if (isIE11) {
    const activeElement = getActiveElement(event.currentTarget as Element);
    return activeElement as HTMLElement | null;
  }
  return event.relatedTarget as HTMLElement | null;
}
