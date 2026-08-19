import { initEvent } from "./__init-event.ts";
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

// Each phase derives `buttons` from the button it simulates. `mouseDown` and
// `mouseUp` run a single phase, so an explicit value describes a chord there and
// wins. A multi-step helper runs every phase from one init, where no single
// value is right for all of them, so it drops `buttons` with `omitButtons`.

/**
 * Drops `buttons` from the options a multi-step helper threads through its
 * phases, so each phase derives its own value. Keeping it would let the press
 * report a mask that omits the button it is pressing, a state no pointing
 * device can be in.
 */
export function omitButtons(options?: PointerEventInit): PointerEventInit {
  const stepOptions = { ...options };
  delete stepOptions.buttons;
  return stepOptions;
}

/**
 * Returns the event properties for moving the pointer onto the element, before
 * any button is pressed. One init feeds both the pointer and the mouse events,
 * so `button` reports the mouse-event value rather than the `-1` a real
 * `pointermove` uses when no button changed state.
 * https://w3c.github.io/pointerevents/#the-button-property
 */
export function getHoverOptions(options?: PointerEventInit): PointerEventInit {
  return { ...options, button: 0, buttons: 0 };
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

// Pointer Events fires no `pointerdown` or `pointerup` for a chorded button
// change, where a button changes state while another one stays held down. The
// change rides on `pointermove` instead, and only the compatibility mouse
// events fire for each button.
// https://w3c.github.io/pointerevents/#chorded-button-interactions

/**
 * Whether the press described by these press options happens while another
 * button is already held down. The pressed button is part of `buttons` at this
 * point, so its own bit is left out of the check.
 */
export function isChordedPress(options: PointerEventInit) {
  const pressedBit = buttonsByButton[getMouseButton(options)] ?? 0;
  return ((options.buttons ?? 0) & ~pressedBit) !== 0;
}

/**
 * Whether the release described by these release options leaves another button
 * held down. The released button is already out of `buttons` at this point.
 */
export function isChordedRelease(options: PointerEventInit) {
  return (options.buttons ?? 0) !== 0;
}

// `@testing-library/dom` has no `auxclick` in its event map, so `dispatch` can't
// build this one by name.
export function dispatchAuxClick(element: Element, options?: MouseEventInit) {
  const { defaultView } = element.ownerDocument;
  const MouseEventConstructor = defaultView?.MouseEvent ?? MouseEvent;
  const init: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
    detail: 1,
    ...options,
  };
  const event = new MouseEventConstructor("auxclick", init);
  // Run the same initialization a named dispatcher does, so this step reports
  // the same modifier state as the rest of the gesture that fires it.
  // https://github.com/ariakit/ariakit/issues/7165
  initEvent(event, init);
  return dispatch(element, event);
}
