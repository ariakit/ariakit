import { dispatch } from "./dispatch.ts";

// `MouseEvent.buttons` is a bitmask of the buttons currently held down, and its
// bits are not ordered like `MouseEvent.button`: the secondary button is bit 1
// while the auxiliary button is bit 2. Pointer Events defines the whole mapping,
// including the pen eraser.
// https://w3c.github.io/pointerevents/#the-buttons-property
const buttonsByButton: Record<number, number> = {
  0: 1,
  1: 4,
  2: 2,
  3: 8,
  4: 16,
  5: 32,
};

export function getMouseButton(options?: MouseEventInit) {
  return options?.button ?? 0;
}

// The three helpers below default `buttons` to the state their phase implies. A
// chorded gesture holds buttons that can't be inferred from the button being
// pressed, and `buttons` is the only way to express it, so an explicit value
// always wins.

/**
 * Returns the event properties for moving the pointer onto the element, before
 * any button is pressed. One init feeds both the pointer and the mouse events,
 * so `button` reports the mouse-event value rather than the `-1` a real
 * `pointermove` uses when no button changed state.
 * https://w3c.github.io/pointerevents/#the-button-property
 */
export function getHoverOptions(options?: PointerEventInit): PointerEventInit {
  return { ...options, button: 0, buttons: options?.buttons ?? 0 };
}

/**
 * Returns the event properties for the press, with `buttons` reflecting the
 * button being held down.
 */
export function getPressOptions(options?: PointerEventInit): PointerEventInit {
  const button = getMouseButton(options);
  return {
    ...options,
    button,
    buttons: options?.buttons ?? buttonsByButton[button] ?? 0,
  };
}

/**
 * Returns the event properties for the release, once the button is no longer
 * held down.
 */
export function getReleaseOptions(
  options?: PointerEventInit,
): PointerEventInit {
  return {
    ...options,
    button: getMouseButton(options),
    buttons: options?.buttons ?? 0,
  };
}

// `@testing-library/dom` has no `auxclick` in its event map, so `dispatch` can't
// build this one by name.
export function dispatchAuxClick(element: Element, options?: MouseEventInit) {
  const { defaultView } = element.ownerDocument;
  const MouseEventConstructor = defaultView?.MouseEvent ?? MouseEvent;
  const event = new MouseEventConstructor("auxclick", {
    bubbles: true,
    cancelable: true,
    composed: true,
    detail: 1,
    ...options,
  });
  return dispatch(element, event);
}
