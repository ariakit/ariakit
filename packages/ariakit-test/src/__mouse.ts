import { getKeys } from "@ariakit/utils";
import type { PointerEventInitWithPersistentDeviceId } from "./__init-event.ts";

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
  options: PointerEventInitWithPersistentDeviceId | undefined,
  keys: ReadonlyArray<keyof PointerEventInitWithPersistentDeviceId>,
): PointerEventInitWithPersistentDeviceId {
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

// A pointing device with no pressure sensor, which is what these helpers
// simulate, reports 0.5 while it is in the active buttons state and 0 otherwise.
// https://w3c.github.io/pointerevents/#dom-pointerevent-pressure
function getPressure(buttons: number) {
  return buttons === 0 ? 0 : 0.5;
}

// Neither `dispatch` nor the phase builders below can own these, because
// `click.ts` and `select.ts` build `click`, `auxclick`, and `contextmenu` from
// the same gesture options, and Pointer Events resets every pointer attribute on
// those three except `pointerId` and `pointerType`. Unlike the contact size and
// transducer angle `dispatch` defaults, these two reset to something other than
// what a gesture derives. Only the helpers that fire pointer events apply them,
// so the click-family options below never pick them up.
// https://www.w3.org/TR/pointerevents/#the-click-auxclick-and-contextmenu-events

/**
 * Fills in the members describing the pointer a phase simulates: these helpers
 * drive one pointer, which is the primary pointer of its type, and the pressure
 * follows the `buttons` the phase options already describe.
 * https://w3c.github.io/pointerevents/#dom-pointerevent-isprimary
 */
export function getPointerOptions(
  options?: PointerEventInit,
): PointerEventInit {
  return {
    ...options,
    pressure: options?.pressure ?? getPressure(options?.buttons ?? 0),
    isPrimary: options?.isPrimary ?? true,
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

type PointerIdentityAttribute = "pointerId" | "pointerType";

type ClickResetAttribute = Exclude<
  keyof PointerEventInitWithPersistentDeviceId,
  keyof MouseEventInit | PointerIdentityAttribute
>;

// The pointer-specific values a caller described for the press, which the
// click-family events reset so each member falls back to the value `dispatch`
// gives a device that reports none. Only the causal pointer's ID and type carry
// over.
//
// Keyed rather than listed so TypeScript requires every non-identity member. A
// list silently missed `altitudeAngle`, `azimuthAngle`, `coalescedEvents`, and
// `predictedEvents`, and `PointerEventInit` keeps growing.
// https://github.com/ariakit/ariakit/pull/7177#discussion_r3811185510
const clickResetAttributes: Record<ClickResetAttribute, true> = {
  isPrimary: true,
  width: true,
  height: true,
  pressure: true,
  tangentialPressure: true,
  tiltX: true,
  tiltY: true,
  twist: true,
  altitudeAngle: true,
  azimuthAngle: true,
  persistentDeviceId: true,
  coalescedEvents: true,
  predictedEvents: true,
};

const clickResetAttributeKeys = getKeys(clickResetAttributes);

/**
 * Returns the event properties for the `click` or `auxclick` that ends the
 * gesture, with every pointer-specific member except the ID and type reset.
 */
export function getClickOptions(options?: PointerEventInit): PointerEventInit {
  return {
    detail: 1,
    ...omit(getReleaseOptions(options), clickResetAttributeKeys),
  };
}

/**
 * Returns the event properties for the `contextmenu` the secondary button opens
 * while it is still held down, with the same pointer-specific reset.
 */
export function getContextMenuOptions(
  options?: PointerEventInit,
): PointerEventInit {
  return omit(getPressOptions(options), clickResetAttributeKeys);
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
