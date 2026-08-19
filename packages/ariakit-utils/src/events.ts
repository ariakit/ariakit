/**
 * Event helpers for dispatching and interpreting browser events.
 * @module Event utilities
 */

import { contains, getWindow, isElement, isNode } from "./dom.ts";
import { hasOwnProperty } from "./misc.ts";
import { isApple } from "./platform.ts";

/**
 * Returns `true` if `event` has been fired within a React Portal element.
 */
export function isPortalEvent(
  event: Pick<Event, "currentTarget" | "target">,
): boolean {
  const { currentTarget, target } = event;
  if (!currentTarget) return false;
  // Non-node targets cannot be contained; treat them as outside instead of
  // letting `contains` throw. Keep non-element Nodes supported.
  if (!isNode(target)) return true;
  return !contains(currentTarget as Node, target);
}

/**
 * Returns `true` if `event.target` and `event.currentTarget` are the same.
 */
export function isSelfTarget(
  event: Pick<Event, "target" | "currentTarget">,
): boolean {
  return event.target === event.currentTarget;
}

function isActivatableNavigationTarget(element: EventTarget | null) {
  if (!isElement(element)) return false;
  const target = element as
    | HTMLAnchorElement
    | HTMLButtonElement
    | HTMLInputElement;
  const tagName = target.tagName.toLowerCase();
  if (tagName === "a") return true;
  if (tagName === "button" && target.type === "submit") return true;
  if (tagName === "input" && target.type === "submit") return true;
  return false;
}

/**
 * Checks whether the user event is triggering a page navigation in a new tab.
 */
export function isOpeningInNewTab(
  event: Pick<MouseEvent, "currentTarget" | "metaKey" | "ctrlKey">,
) {
  const isAppleDevice = isApple();
  if (isAppleDevice && !event.metaKey) return false;
  if (!isAppleDevice && !event.ctrlKey) return false;
  return isActivatableNavigationTarget(event.currentTarget);
}

/**
 * Checks whether the user event is triggering a download.
 */
export function isDownloading(
  event: Pick<MouseEvent, "altKey" | "currentTarget">,
) {
  if (!event.altKey) return false;
  return isActivatableNavigationTarget(event.currentTarget);
}

/**
 * Creates and dispatches an event.
 * @example
 * fireEvent(document.getElementById("id"), "blur", {
 *   bubbles: true,
 *   cancelable: true,
 * });
 */
export function fireEvent(
  element: Element,
  type: string,
  eventInit?: EventInit,
) {
  // Built by the window that owns the element, so a listener inside a
  // same-origin frame gets an event that its own interfaces recognize. The
  // helpers below do the same. https://github.com/ariakit/ariakit/issues/7193
  const { Event } = getWindow(element);
  const event = new Event(type, eventInit);
  return element.dispatchEvent(event);
}

/**
 * Creates and dispatches a blur event.
 * @example
 * fireBlurEvent(document.getElementById("id"));
 */
export function fireBlurEvent(element: Element, eventInit?: FocusEventInit) {
  const { FocusEvent } = getWindow(element);
  const event = new FocusEvent("blur", eventInit);
  const defaultAllowed = element.dispatchEvent(event);
  const bubbleInit = { ...eventInit, bubbles: true };
  element.dispatchEvent(new FocusEvent("focusout", bubbleInit));
  return defaultAllowed;
}

/**
 * Creates and dispatches a focus event.
 * @example
 * fireFocusEvent(document.getElementById("id"));
 */
export function fireFocusEvent(element: Element, eventInit?: FocusEventInit) {
  const { FocusEvent } = getWindow(element);
  const event = new FocusEvent("focus", eventInit);
  const defaultAllowed = element.dispatchEvent(event);
  const bubbleInit = { ...eventInit, bubbles: true };
  element.dispatchEvent(new FocusEvent("focusin", bubbleInit));
  return defaultAllowed;
}

/**
 * Creates and dispatches a keyboard event.
 * @example
 * fireKeyboardEvent(document.getElementById("id"), "keydown", {
 *   key: "ArrowDown",
 *   shiftKey: true,
 * });
 */
export function fireKeyboardEvent(
  element: Element,
  type: string,
  eventInit?: KeyboardEventInit,
) {
  const { KeyboardEvent } = getWindow(element);
  const event = new KeyboardEvent(type, eventInit);
  return element.dispatchEvent(event);
}

type PointerIdentityAttribute = "pointerId" | "pointerType";

type ResetAttribute =
  | Exclude<
      keyof PointerEventInit,
      keyof MouseEventInit | PointerIdentityAttribute
    >
  // Chromium and Firefox read this one from the init, but `lib.dom` doesn't
  // declare it on `PointerEventInit` yet, so `Exclude` can't find it. Measured
  // leaking a caller's value onto the click in both, where their own click
  // reports 0.
  | "persistentDeviceId";

// Pointer Events requires every pointer attribute other than `pointerId` and
// `pointerType` to have its default value on a click, so the event never
// reports the contact a press described. `isPrimary` is one of them, even
// though it identifies the pointer rather than the contact: Firefox and WebKit
// carry a caller's value over where Chromium resets it, and the specification,
// not the engine count, decides which is right.
//
// Keyed rather than listed so TypeScript requires every non-identity member it
// knows about, because `PointerEventInit` keeps growing.
// https://www.w3.org/TR/pointerevents/#the-click-auxclick-and-contextmenu-events
const resetAttributes: Record<ResetAttribute, true> = {
  width: true,
  height: true,
  pressure: true,
  tangentialPressure: true,
  tiltX: true,
  tiltY: true,
  twist: true,
  altitudeAngle: true,
  azimuthAngle: true,
  isPrimary: true,
  coalescedEvents: true,
  predictedEvents: true,
  persistentDeviceId: true,
};

// Chromium, Firefox, and WebKit all report an unset pointer on a click no
// pointer caused, such as keyboard activation, so the event doesn't claim a
// mouse pressed the element.
//
// The constructor reads the init through the prototype chain, so a caller can
// pass a live event. Copying it would flatten it to its own properties, which a
// live event mostly doesn't have, and inheriting from it would break the native
// getters' brand checks, so the members are layered on with a proxy instead.
function getClickEventInit(eventInit?: PointerEventInit | null) {
  const init = eventInit ?? {};
  // Proxying a fresh object rather than the caller's, because a trap may not
  // report a value different from a frozen own property of its target, and
  // every member below is layered over whatever the caller froze. Only the
  // constructor reads the result, and it reads each member by name, so the
  // empty target reporting no own keys is not observable.
  const target: PointerEventInit = {};
  return new Proxy(target, {
    get(_target, key) {
      if (key === "pointerId") return init.pointerId ?? -1;
      if (key === "pointerType") return init.pointerType ?? "";
      // Reading one of them as absent leaves the constructor's own default,
      // which is the value browsers report on a click.
      if (hasOwnProperty(resetAttributes, key)) return undefined;
      // Rooted at the caller's init rather than at the empty target, so a
      // native getter runs against the object that owns it.
      return Reflect.get(init, key);
    },
  });
}

/**
 * Creates and dispatches a click event.
 *
 * The event is a `PointerEvent` built by the window that owns the element, the
 * way browsers dispatch it, falling back to a `MouseEvent` where that window
 * has no `PointerEvent`. It reports no pointer behind the click unless the
 * caller passes one, and reports every other pointer attribute at its default
 * value, the way a click always does.
 * @example
 * fireClickEvent(document.getElementById("id"));
 */
export function fireClickEvent(
  element: Element,
  eventInit?: PointerEventInit | null,
) {
  const view = getWindow(element);
  // Falls back to `MouseEvent` where `PointerEvent` is missing, so activation
  // keeps working there and only the pointer members are dropped.
  const EventConstructor = view.PointerEvent ?? view.MouseEvent;
  const event = new EventConstructor("click", getClickEventInit(eventInit));
  return element.dispatchEvent(event);
}

/**
 * Checks whether the focus/blur event is happening from/to outside of the
 * container element.
 * @example
 * const element = document.getElementById("id");
 * element.addEventListener("blur", (event) => {
 *   if (isFocusEventOutside(event)) {
 *     // ...
 *   }
 * });
 */
export function isFocusEventOutside(
  event: Pick<FocusEvent, "currentTarget" | "relatedTarget">,
  container?: Element | null,
) {
  const containerElement = container || (event.currentTarget as Element);
  const relatedTarget = event.relatedTarget;
  // Non-node targets cannot be contained; treat them as outside instead of
  // letting `contains` throw. Keep non-element Nodes supported.
  return !isNode(relatedTarget) || !contains(containerElement, relatedTarget);
}

/**
 * Returns the `inputType` property of the event, if available.
 */
export function getInputType(event: Event | { nativeEvent: Event }) {
  const nativeEvent = "nativeEvent" in event ? event.nativeEvent : event;
  if (!nativeEvent) return;
  if (!("inputType" in nativeEvent)) return;
  if (typeof nativeEvent.inputType !== "string") return;
  return nativeEvent.inputType;
}

/**
 * Checks whether the event is an input event.
 */
export function isInputEvent(event: Event): event is InputEvent {
  return event.type === "input";
}

/**
 * Runs a callback on the next animation frame, but before a certain event.
 */
export function queueBeforeEvent(
  element: Element,
  type: string,
  callback: () => void,
  timeout?: number,
) {
  const createTimer = (callback: () => void) => {
    if (timeout) {
      const timerId = setTimeout(callback, timeout);
      return () => clearTimeout(timerId);
    }
    const timerId = requestAnimationFrame(callback);
    return () => cancelAnimationFrame(timerId);
  };

  const cancelTimer = createTimer(() => {
    element.removeEventListener(type, callSync, true);
    callback();
  });
  const callSync = () => {
    cancelTimer();
    callback();
  };
  // By listening to the event in the capture phase, we make sure the callback
  // is fired before the respective React events.
  element.addEventListener(type, callSync, { once: true, capture: true });
  return () => {
    cancelTimer();
    element.removeEventListener(type, callSync, true);
  };
}

export function addGlobalEventListener<K extends keyof DocumentEventMap>(
  type: K,
  listener: (event: DocumentEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
  scope?: Window,
): () => void;
export function addGlobalEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
  scope?: Window,
): () => void;

/**
 * Adds a global event listener, including on child frames.
 */
export function addGlobalEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
  scope: Window = window,
) {
  const children: Array<() => void> = [];

  // Prevent errors from "sandbox" frames.
  try {
    scope.document.addEventListener(type, listener, options);
    for (const frame of Array.from(scope.frames)) {
      children.push(addGlobalEventListener(type, listener, options, frame));
    }
  } catch {}

  const removeEventListener = () => {
    try {
      scope.document.removeEventListener(type, listener, options);
    } catch {}
    for (const remove of children) {
      remove();
    }
  };

  return removeEventListener;
}
