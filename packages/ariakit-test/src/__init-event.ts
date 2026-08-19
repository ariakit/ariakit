// Part of this code is based on https://github.com/testing-library/user-event/blob/d7483f049a1ec2ebf1ca1e2c1f4367849fca5997/src/event/createEvent.ts
import { getKeys } from "@ariakit/utils";

type SpecificEventInit<E extends Event> = E extends InputEvent
  ? InputEventInit
  : E extends ClipboardEvent
    ? ClipboardEventInit
    : E extends KeyboardEvent
      ? KeyboardEventInit
      : E extends PointerEvent
        ? PointerEventInit
        : E extends MouseEvent
          ? MouseEventInit
          : E extends UIEvent
            ? UIEventInit
            : EventInit;

function assignProps<T extends object>(
  obj: T,
  props: { [k in keyof T]?: T[k] },
) {
  for (const [key, value] of Object.entries(props)) {
    // Configurable, matching the descriptors browsers and jsdom give these
    // members, so a member assigned here can be replaced afterwards. It cannot
    // rescue a redefine of a member `createEvent` already installed as
    // non-configurable, which is what #7179 tracks.
    Object.defineProperty(obj, key, {
      configurable: true,
      get: () => value ?? null,
    });
  }
}

function sanitizeNumber(n: number | undefined) {
  return n ?? 0;
}

function sanitizeString(value: string | undefined) {
  return value ?? "";
}

function initClipboardEvent(
  event: ClipboardEvent,
  { clipboardData }: ClipboardEventInit,
) {
  assignProps(event, {
    clipboardData,
  });
}

function initInputEvent(
  event: InputEvent,
  { data, inputType, isComposing }: InputEventInit,
) {
  assignProps(event, {
    data,
    isComposing: !!isComposing,
    inputType: sanitizeString(inputType),
  });
}

function initUIEvent(event: UIEvent, { view, detail }: UIEventInit) {
  assignProps(event, {
    view,
    detail: sanitizeNumber(detail),
  });
}

// Everything `EventModifierInit` adds to `UIEventInit`, which is exactly the
// members that name a modifier.
type ModifierInitMember = Exclude<keyof EventModifierInit, keyof UIEventInit>;

// The modifier name `getModifierState` answers to, for each of those members.
// `satisfies` makes the compiler reject a table that misses one, which is how
// the previous table silently lost `modifierHyper` and `modifierSuper`. In a
// test environment the keyboard shim answers a caller-built event from the same
// members, so both forms of `dispatch` agree there. A real browser gets no
// shim, and reports neither `Hyper` nor `Super`.
// https://w3c.github.io/uievents/#event-modifier-initializers
const modifierNameByInitMember = {
  altKey: "Alt",
  ctrlKey: "Control",
  metaKey: "Meta",
  shiftKey: "Shift",
  modifierAltGraph: "AltGraph",
  modifierCapsLock: "CapsLock",
  modifierFn: "Fn",
  modifierFnLock: "FnLock",
  modifierHyper: "Hyper",
  modifierNumLock: "NumLock",
  modifierScrollLock: "ScrollLock",
  modifierSuper: "Super",
  modifierSymbol: "Symbol",
  modifierSymbolLock: "SymbolLock",
} as const satisfies Record<ModifierInitMember, string>;

function initUIEventModifiers(
  event: KeyboardEvent | MouseEvent,
  init: EventModifierInit,
) {
  const { altKey, ctrlKey, metaKey, shiftKey } = init;
  // A `Set` of the pressed names, so an unrecognized name reports false. An
  // object literal would resolve `Object.prototype` member names such as
  // `constructor` to an inherited value and report them as pressed.
  // https://github.com/ariakit/ariakit/issues/7168
  const pressed = new Set<string>();
  for (const member of getKeys(modifierNameByInitMember)) {
    if (init[member]) {
      pressed.add(modifierNameByInitMember[member]);
    }
  }
  assignProps(event, {
    altKey: !!altKey,
    ctrlKey: !!ctrlKey,
    metaKey: !!metaKey,
    shiftKey: !!shiftKey,
    getModifierState(key: string) {
      return pressed.has(key);
    },
  });
}

function initKeyboardEvent(
  event: KeyboardEvent,
  { key, code, location, repeat, isComposing, charCode }: KeyboardEventInit,
) {
  assignProps(event, {
    key: sanitizeString(key),
    code: sanitizeString(code),
    location: sanitizeNumber(location),
    repeat: !!repeat,
    isComposing: !!isComposing,
  });
  if (charCode != null) {
    assignProps(event, {
      charCode: sanitizeNumber(charCode),
    });
  }
}

function initMouseEvent(
  event: MouseEvent,
  {
    x,
    y,
    screenX,
    screenY,
    clientX = x,
    clientY = y,
    movementX,
    movementY,
    button,
    buttons,
    relatedTarget,
  }: MouseEventInit & { x?: number; y?: number },
) {
  assignProps(event, {
    screenX: sanitizeNumber(screenX),
    screenY: sanitizeNumber(screenY),
    clientX: sanitizeNumber(clientX),
    x: sanitizeNumber(clientX),
    clientY: sanitizeNumber(clientY),
    y: sanitizeNumber(clientY),
    movementX: sanitizeNumber(movementX),
    movementY: sanitizeNumber(movementY),
    button: sanitizeNumber(button),
    buttons: sanitizeNumber(buttons),
    relatedTarget,
  });
}

function initPointerEvent(
  event: PointerEvent,
  {
    pointerId,
    width,
    height,
    pressure,
    tangentialPressure,
    tiltX,
    tiltY,
    twist,
    isPrimary,
    pointerType = "mouse",
  }: PointerEventInit,
) {
  assignProps(event, {
    pointerId: sanitizeNumber(pointerId),
    width: sanitizeNumber(width),
    height: sanitizeNumber(height),
    pressure: sanitizeNumber(pressure),
    tangentialPressure: sanitizeNumber(tangentialPressure),
    tiltX: sanitizeNumber(tiltX),
    tiltY: sanitizeNumber(tiltY),
    twist: sanitizeNumber(twist),
    isPrimary: !!isPrimary,
    pointerType: pointerType,
  });
}

// Event types whose browser interface derives from `MouseEvent` while the test
// environment's class doesn't. happy-dom's `WheelEvent` extends `UIEvent` and
// its `DragEvent` is an alias for `Event`, and jsdom ships no `DragEvent` at
// all, so `instanceof` alone would leave these events without the
// `MouseEventInit` and modifier init members their browser interface accepts.
// https://github.com/ariakit/ariakit/issues/7169
const mouseDerivedEventTypes = new Set([
  "drag",
  "dragend",
  "dragenter",
  "dragexit",
  "dragleave",
  "dragover",
  "dragstart",
  "drop",
  "wheel",
]);

function isMouseEvent(event: Event): event is MouseEvent {
  if (event instanceof MouseEvent) return true;
  return mouseDerivedEventTypes.has(event.type);
}

function isUIEvent(event: Event): event is UIEvent {
  if (event instanceof UIEvent) return true;
  // `MouseEvent` derives from `UIEvent`, so anything carrying the mouse members
  // carries the `UIEvent` ones too.
  return isMouseEvent(event);
}

/**
 * Runs each initializer below whose interface applies to this event, assigning
 * the members it reads from `options`. A member no initializer names keeps
 * whatever the constructor gave it, which is how `which` stays computed from
 * `keyCode` under happy-dom. Only a caller that built the event for a known
 * event name may run this, because it overwrites whatever the constructor did
 * with the values in `options`.
 */
export function initEvent<T extends Event>(
  event: T,
  options: SpecificEventInit<T> = {} as SpecificEventInit<T>,
) {
  if (event instanceof ClipboardEvent) {
    initClipboardEvent(event, options);
  }
  if (event instanceof InputEvent) {
    initInputEvent(event, options);
  }
  if (isUIEvent(event)) {
    initUIEvent(event, options);
  }
  if (event instanceof KeyboardEvent) {
    initKeyboardEvent(event, options);
    initUIEventModifiers(event, options);
  }
  if (isMouseEvent(event)) {
    initMouseEvent(event, options);
    initUIEventModifiers(event, options);
  }
  if (event instanceof PointerEvent) {
    initPointerEvent(event, options);
  }
}
