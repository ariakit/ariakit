// Part of this code is based on https://github.com/testing-library/user-event/blob/d7483f049a1ec2ebf1ca1e2c1f4367849fca5997/src/event/createEvent.ts
import { getKeys, invariant } from "@ariakit/utils";
import type { EventType } from "./__dom/events.ts";
import { createEvent, fireEvent } from "./__dom/events.ts";
import { flushMicrotasks, wrapAsync } from "./__utils.ts";

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

type Target = Document | Window | Node | Element | null;

type EventFunction = (element: Target, options?: object) => Promise<boolean>;

type EventsObject = {
  [K in EventType]: EventFunction;
};

function assignProps<T extends object>(
  obj: T,
  props: { [k in keyof T]?: T[k] },
) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(obj, key, { get: () => value ?? null });
  }
}

function sanitizeNumber(n: number | undefined) {
  return n ?? 0;
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
    inputType: String(inputType),
  });
}

function initUIEvent(event: UIEvent, { view, detail }: UIEventInit) {
  assignProps(event, {
    view,
    detail: sanitizeNumber(detail ?? 0),
  });
}

function initUIEventModififiers(
  event: KeyboardEvent | MouseEvent,
  {
    altKey,
    ctrlKey,
    metaKey,
    shiftKey,
    modifierAltGraph,
    modifierCapsLock,
    modifierFn,
    modifierFnLock,
    modifierNumLock,
    modifierScrollLock,
    modifierSymbol,
    modifierSymbolLock,
  }: EventModifierInit,
) {
  assignProps(event, {
    altKey: !!altKey,
    ctrlKey: !!ctrlKey,
    metaKey: !!metaKey,
    shiftKey: !!shiftKey,
    getModifierState(k: string) {
      return Boolean(
        {
          Alt: altKey,
          AltGraph: modifierAltGraph,
          CapsLock: modifierCapsLock,
          Control: ctrlKey,
          Fn: modifierFn,
          FnLock: modifierFnLock,
          Meta: metaKey,
          NumLock: modifierNumLock,
          ScrollLock: modifierScrollLock,
          Shift: shiftKey,
          Symbol: modifierSymbol,
          SymbolLock: modifierSymbolLock,
        }[k],
      );
    },
  });
}

function initKeyboardEvent(
  event: KeyboardEvent,
  { key, code, location, repeat, isComposing }: KeyboardEventInit,
) {
  assignProps(event, {
    key: String(key),
    code: String(code),
    location: sanitizeNumber(location),
    repeat: !!repeat,
    isComposing: !!isComposing,
  });
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

function initEvent<T extends Event>(
  event: T,
  options: SpecificEventInit<T> = {} as SpecificEventInit<T>,
) {
  if (event instanceof ClipboardEvent) {
    initClipboardEvent(event, options);
  }
  if (event instanceof InputEvent) {
    initInputEvent(event, options);
  }
  if (event instanceof UIEvent) {
    initUIEvent(event, options);
  }
  if (event instanceof KeyboardEvent) {
    initKeyboardEvent(event, options);
    initUIEventModififiers(event, options);
  }
  if (event instanceof MouseEvent) {
    initMouseEvent(event, options);
    initUIEventModififiers(event, options);
  }
  if (event instanceof PointerEvent) {
    initPointerEvent(event, options);
  }
}

const pointerEvents = [
  "mousemove",
  "mouseover",
  "mouseenter",
  "mouseout",
  "mouseleave",
  "mousedown",
  "mouseup",
  "pointermove",
  "pointerover",
  "pointerenter",
  "pointerout",
  "pointerleave",
  "pointerdown",
  "pointerup",
  "click",
];

function baseDispatch(element: Target, event: Event): Promise<boolean> {
  return wrapAsync(async () => {
    invariant(element, `Unable to dispatch ${event.type} on null element`);

    const eventName = event.type.toLowerCase();

    if (pointerEvents.includes(eventName) && "classList" in element) {
      const { pointerEvents } = getComputedStyle(element);
      if (pointerEvents === "none") {
        if (element.parentElement) {
          // Recursive so we'll repeat the process if the parent element also
          // has pointerEvents: none
          return baseDispatch(element.parentElement, event);
        }
        return true;
      }
    }
    const defaultAllowed = fireEvent(element, event);
    await flushMicrotasks();
    return defaultAllowed;
  });
}

const events = getKeys(fireEvent).reduce((events, eventName) => {
  events[eventName] = (element, options) => {
    invariant(element, `Unable to dispatch ${eventName} on null element`);
    const event = createEvent[eventName](element, options);
    initEvent(event, options);
    return baseDispatch(element, event);
  };
  return events;
}, {} as EventsObject);

/**
 * Creates and fires a DOM event on an element, then waits for the resulting
 * microtasks to flush. Call `dispatch.<eventName>(element, options)` to build and
 * fire a specific event (e.g. `dispatch.keyDown`, `dispatch.click`,
 * `dispatch.input`), or call `dispatch(element, event)` directly with an `Event`
 * instance.
 *
 * Unlike higher-level helpers such as `click` and `type`, this fires a single
 * event without simulating the surrounding interaction sequence. Pointer and
 * mouse events fired on an element with `pointer-events: none` are re-dispatched
 * on the nearest ancestor that has pointer events enabled, matching how browsers
 * route those events.
 * @returns A promise that resolves to `false` when the event's default action was
 * prevented with `event.preventDefault()`, and `true` otherwise.
 * @example
 * ```ts
 * await dispatch.keyDown(q.textbox(), { key: "Enter" });
 * await dispatch.click(q.button());
 * // Fire a custom event instance directly:
 * await dispatch(q.textbox(), new Event("selectstart", { bubbles: true }));
 * ```
 */
export const dispatch = Object.assign(baseDispatch, events);
