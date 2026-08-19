import { getKeys } from "@ariakit/utils";

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

function omit(
  options: PointerEventInit | undefined,
  keys: ReadonlyArray<keyof PointerEventInit>,
): PointerEventInit {
  const remaining = { ...options };
  for (const key of keys) {
    delete remaining[key];
  }
  return remaining;
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
  return omit(options, ["buttons"]);
}

type PointerIdentityAttribute = "pointerId" | "pointerType" | "isPrimary";

type ContactAttribute = Exclude<
  keyof PointerEventInit,
  keyof MouseEventInit | PointerIdentityAttribute
>;

// The attributes that describe the contact itself rather than the pointer that
// made it. `isPrimary` is left out deliberately, not by that rule: the
// specification resets every pointer attribute here except `pointerId` and
// `pointerType`, and Chromium follows it, but Firefox and WebKit carry
// `isPrimary` over, so a value the caller passes explicitly is kept.
//
// Keyed rather than listed so TypeScript requires every non-identity member. A
// list silently missed the four below, and `PointerEventInit` keeps growing.
// https://github.com/ariakit/ariakit/pull/7177#discussion_r3811185510
const contactAttributes: Record<ContactAttribute, true> = {
  width: true,
  height: true,
  pressure: true,
  tangentialPressure: true,
  tiltX: true,
  tiltY: true,
  twist: true,
  altitudeAngle: true,
  azimuthAngle: true,
  coalescedEvents: true,
  predictedEvents: true,
};

const contactAttributeKeys = getKeys(contactAttributes);

/**
 * Drops the contact attributes, which don't survive into `click`, `auxclick`,
 * and `contextmenu`, keeping the members that identify the pointer behind them.
 * Browsers reset the contact there: a pen press reporting `tiltX: 30` still ends
 * in a `click` reporting `tiltX: 0`.
 * https://www.w3.org/TR/pointerevents/#the-click-auxclick-and-contextmenu-events
 */
export function omitContactAttributes(
  options?: PointerEventInit,
): PointerEventInit {
  return omit(options, contactAttributeKeys);
}

/**
 * Returns only the members that identify the pointer behind a gesture, for an
 * event a browser derives from another one, like the `click` a label forwards to
 * its control.
 */
export function getPointerIdentity(
  options?: PointerEventInit,
): PointerEventInit {
  return {
    pointerId: options?.pointerId,
    pointerType: options?.pointerType,
    isPrimary: options?.isPrimary,
  };
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

/**
 * Returns the event properties for the `click` or `auxclick` that ends the
 * gesture, which a browser fires on the release with the contact reset.
 */
export function getClickOptions(options?: PointerEventInit): PointerEventInit {
  return { detail: 1, ...omitContactAttributes(getReleaseOptions(options)) };
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
