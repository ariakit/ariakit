// Part of this code is based on https://github.com/testing-library/user-event/blob/d7483f049a1ec2ebf1ca1e2c1f4367849fca5997/src/event/createEvent.ts
import { getKeys } from "@ariakit/utils";
import type { OwnerWindowSource } from "./__utils.ts";
import { getOwnerWindow } from "./__utils.ts";

// Pointer Events Level 4 includes this member in its initializer, but TypeScript
// 6.0 declares it only on the resulting event.
export type PointerEventInitWithPersistentDeviceId = PointerEventInit & {
  persistentDeviceId?: PointerEvent["persistentDeviceId"];
};

type SpecificEventInit<E extends Event> = E extends InputEvent
  ? InputEventInit
  : E extends ClipboardEvent
    ? ClipboardEventInit
    : E extends KeyboardEvent
      ? KeyboardEventInit
      : E extends PointerEvent
        ? PointerEventInitWithPersistentDeviceId
        : E extends MouseEvent
          ? MouseEventInit
          : E extends CompositionEvent
            ? CompositionEventInit
            : E extends UIEvent
              ? UIEventInit
              : EventInit;

// The realm whose constructors an interface test runs against: the window that
// owns the target the event was built for, or the ambient globals when that
// target has no window. `createEvent` resolves the constructor the same way, so
// an event built for a node inside a same-origin iframe belongs to that frame
// and matches no ambient `instanceof`.
// https://github.com/ariakit/ariakit/issues/7195
type EventRealm = typeof globalThis;

function getEventRealm(target: OwnerWindowSource): EventRealm {
  return getOwnerWindow(target) ?? globalThis;
}

// A realm doesn't necessarily implement every interface `initEvent` tests for,
// so a missing constructor has to answer false rather than throw. jsdom has
// `PointerEvent` only from v27 on, and `shims.ts` installs `ClipboardEvent` on
// the ambient realm only, so an iframe realm has none even though the top one
// does. https://github.com/ariakit/ariakit/issues/7200
function isInstanceOf<T>(
  event: Event,
  constructor: (new (...args: never[]) => T) | undefined,
): event is Event & T {
  return typeof constructor === "function" && event instanceof constructor;
}

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

function sanitizeString(value: string | null | undefined) {
  return value ?? "";
}

// `PointerEventInit` defaults the contact geometry to 1x1, and Pointer Events
// requires 1 from a device that doesn't report geometry of its own, like a mouse.
// https://w3c.github.io/pointerevents/#dom-pointerevent-width
function sanitizeContactSize(size: number | undefined) {
  return size ?? 1;
}

// Pointer Events requires π/2, a transducer perpendicular to the screen, from a
// device that reports no tilt. It has no dictionary default, and happy-dom's
// constructor uses 0, an angle no engine produces for a mouse. The tilt pair is
// left unconverted, tracked in https://github.com/ariakit/ariakit/issues/7185.
// https://w3c.github.io/pointerevents/#dom-pointerevent-altitudeangle
function sanitizeAltitudeAngle(angle: number | undefined) {
  return angle ?? Math.PI / 2;
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

// `CompositionEventInit` defaults `data` to the empty string, which is what
// Chromium 151, Firefox 153, and WebKit 26.5 report for an event built without
// it. `data` is also the only member the interface adds to `UIEvent`. The
// parameter accepts `InputEventInit` too, because `initEvent` hands every
// initializer the same options object and that interface declares a nullable
// `data` of its own.
// https://w3c.github.io/uievents/#idl-compositionevent
function initCompositionEvent(
  event: CompositionEvent,
  { data }: CompositionEventInit | InputEventInit,
) {
  assignProps(event, {
    data: sanitizeString(data),
  });
}

// UI Events defines these two, but no engine reports either, even when the
// event is built with the member: measured on Chromium 151, Firefox 153, and
// WebKit 26.5, where `new KeyboardEvent("keydown", { modifierSuper: true })`
// answers false. Every other member below is reported by at least one of the
// three. jsdom reports these two, and is the outlier.
type UnreportedModifierInitMember = "modifierHyper" | "modifierSuper";

// What `EventModifierInit` adds to `UIEventInit`, minus those two, which is
// exactly the members that name a modifier an engine reports.
type ModifierInitMember = Exclude<
  keyof EventModifierInit,
  keyof UIEventInit | UnreportedModifierInitMember
>;

// The modifier name `getModifierState` answers to, for each of those members.
// `satisfies` makes the compiler reject a table that misses one, so a member
// the type above keeps cannot be dropped silently, and one it excludes cannot
// be added back without revisiting that decision.
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
  modifierNumLock: "NumLock",
  modifierScrollLock: "ScrollLock",
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
    altitudeAngle,
    azimuthAngle,
    persistentDeviceId,
    isPrimary,
    pointerType = "mouse",
  }: PointerEventInitWithPersistentDeviceId,
) {
  assignProps(event, {
    pointerId: sanitizeNumber(pointerId),
    width: sanitizeContactSize(width),
    height: sanitizeContactSize(height),
    pressure: sanitizeNumber(pressure),
    tangentialPressure: sanitizeNumber(tangentialPressure),
    tiltX: sanitizeNumber(tiltX),
    tiltY: sanitizeNumber(tiltY),
    twist: sanitizeNumber(twist),
    altitudeAngle: sanitizeAltitudeAngle(altitudeAngle),
    azimuthAngle: sanitizeNumber(azimuthAngle),
    persistentDeviceId: sanitizeNumber(persistentDeviceId),
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

// The same gap one interface further down: jsdom implements `PointerEvent` only
// from v27 on, so an older environment cannot build these from an interface of
// their own, and testing the name as well keeps them initialized there. The
// click family belongs here because Pointer Events defines those three as
// `PointerEvent` too, so they carry the pointer members even where the
// dispatchers build them from `MouseEvent` instead.
// https://github.com/ariakit/ariakit/issues/7178
const pointerEventTypes = new Set([
  "auxclick",
  "click",
  "contextmenu",
  "gotpointercapture",
  "lostpointercapture",
  "pointercancel",
  "pointerdown",
  "pointerenter",
  "pointerleave",
  "pointermove",
  "pointerout",
  "pointerover",
  "pointerup",
]);

function isPointerEvent(
  event: Event,
  realm: EventRealm,
): event is PointerEvent {
  if (isInstanceOf(event, realm.PointerEvent)) return true;
  return pointerEventTypes.has(event.type);
}

function isMouseEvent(event: Event, realm: EventRealm): event is MouseEvent {
  if (isInstanceOf(event, realm.MouseEvent)) return true;
  // `PointerEvent` derives from `MouseEvent`, so a pointer event carries the
  // mouse members too.
  if (isPointerEvent(event, realm)) return true;
  return mouseDerivedEventTypes.has(event.type);
}

// The three types `CompositionEvent` covers. happy-dom aliases the interface to
// `Event`, so `instanceof` there answers true for every event rather than these
// alone, and the type is the only thing that separates them. Any event
// `initEvent` sees with one of these names was built by the matching named
// dispatcher, so the name identifies the interface here.
// https://github.com/ariakit/ariakit/issues/7174
const compositionEventTypes = new Set([
  "compositionstart",
  "compositionupdate",
  "compositionend",
]);

function isCompositionEvent(event: Event): event is CompositionEvent {
  return compositionEventTypes.has(event.type);
}

function isUIEvent(event: Event, realm: EventRealm): event is UIEvent {
  if (isInstanceOf(event, realm.UIEvent)) return true;
  // `MouseEvent` and `CompositionEvent` both derive from `UIEvent`, so anything
  // carrying either interface's members carries the `UIEvent` ones too.
  if (isMouseEvent(event, realm)) return true;
  return isCompositionEvent(event);
}

/**
 * Runs each initializer below whose interface applies to this event, assigning
 * the members it reads from `options`. A member no initializer names keeps
 * whatever the constructor gave it, which is how `which` stays computed from
 * `keyCode` under happy-dom. Only a caller that built the event for a known
 * event name may run this, because it overwrites whatever the constructor did
 * with the values in `options`.
 * @param target The node, document, or window the event was built for, whose
 * realm owns the constructors the interface tests run against.
 */
export function initEvent<T extends Event>(
  event: T,
  target: OwnerWindowSource,
  options: SpecificEventInit<T> = {} as SpecificEventInit<T>,
) {
  const realm = getEventRealm(target);
  if (isInstanceOf(event, realm.ClipboardEvent)) {
    initClipboardEvent(event, options);
  }
  if (isInstanceOf(event, realm.InputEvent)) {
    initInputEvent(event, options);
  }
  if (isUIEvent(event, realm)) {
    initUIEvent(event, options);
  }
  if (isCompositionEvent(event)) {
    initCompositionEvent(event, options);
  }
  if (isInstanceOf(event, realm.KeyboardEvent)) {
    initKeyboardEvent(event, options);
    initUIEventModifiers(event, options);
  }
  if (isMouseEvent(event, realm)) {
    initMouseEvent(event, options);
    initUIEventModifiers(event, options);
  }
  if (isPointerEvent(event, realm)) {
    initPointerEvent(event, options);
  }
}
