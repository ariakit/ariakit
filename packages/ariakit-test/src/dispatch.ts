// Part of this code is based on https://github.com/testing-library/user-event/blob/d7483f049a1ec2ebf1ca1e2c1f4367849fca5997/src/event/createEvent.ts
import { getKeys, invariant } from "@ariakit/utils";
import type { EventType } from "@testing-library/dom";
import { createEvent, fireEvent } from "@testing-library/dom";
import {
  flushMicrotasks,
  isHappyDOM,
  withWindowEvent,
  wrapAsync,
} from "./__utils.ts";

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

// `@testing-library/dom` has no `auxclick` in its event map, so `dispatch` adds
// it to the events it can build by name.
type DispatchEventType = EventType | "auxClick";

type EventsObject = {
  [K in DispatchEventType]: EventFunction;
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
  "auxclick",
  "contextmenu",
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

// happy-dom drops scripted clicks on disabled buttons and inputs, although the
// spec, jsdom, and browsers still run listeners and activation. Restore that
// behavior only here so label forwarding can still suppress its duplicate.
// https://github.com/capricorn86/happy-dom/issues/2190
function fireEventAllowingDisabledClick(
  element: NonNullable<Target>,
  event: Event,
) {
  if (
    isHappyDOM() &&
    event instanceof MouseEvent &&
    event.type === "click" &&
    (element instanceof HTMLButtonElement ||
      element instanceof HTMLInputElement) &&
    element.disabled
  ) {
    return dispatchDisabledControlClick(element, event);
  }
  return fireEvent(element, event);
}

// Snapshot same-name radios from the root: happy-dom may group form-associated
// radios by root rather than `radio.form`. Diffing that superset identifies the
// peer changed by activation.
function getRadioGroup(radio: HTMLInputElement) {
  if (!radio.name) return [radio];
  const root = radio.getRootNode() as ParentNode;
  const radios = Array.from(
    root.querySelectorAll<HTMLInputElement>("input[type='radio']"),
  ).filter((control) => control.name === radio.name);
  return radios.includes(radio) ? radios : [radio, ...radios];
}

// Bypass happy-dom's disabled-control short circuit, applying checkbox/radio
// activation before listeners. Revert only activation-owned changes when
// prevented, and emit input/change only for a committed value change.
function dispatchDisabledControlClick(
  element: HTMLButtonElement | HTMLInputElement,
  event: Event,
) {
  const dispatchThroughBase = () =>
    window.EventTarget.prototype.dispatchEvent.call(element, event);

  const input =
    element instanceof HTMLInputElement &&
    (element.type === "checkbox" || element.type === "radio")
      ? element
      : null;
  if (!input) return dispatchThroughBase();

  const isCheckbox = input.type === "checkbox";
  // A radio selection unchecks a same-name peer, so snapshot the whole group (a
  // checkbox only affects itself) to detect that peer below.
  const group = isCheckbox ? [input] : getRadioGroup(input);
  const snapshot = group.map((control) => ({
    control,
    checked: control.checked,
    indeterminate: control.indeterminate,
  }));

  const wasChecked = input.checked;
  input.checked = isCheckbox ? !wasChecked : true;
  if (isCheckbox) {
    input.indeterminate = false;
  }

  // Exactly the controls the activation changed: the toggled control plus the
  // radio peer happy-dom just unchecked. Reverting only these keeps a prevented
  // click from clobbering state a listener changes during the dispatch.
  const activated = snapshot.filter(
    ({ control, checked, indeterminate }) =>
      control.checked !== checked || control.indeterminate !== indeterminate,
  );

  const defaultAllowed = dispatchThroughBase();

  if (!defaultAllowed) {
    for (const { control, checked, indeterminate } of activated) {
      control.checked = checked;
      control.indeterminate = indeterminate;
    }
    return defaultAllowed;
  }

  // Real browsers fire `input`/`change` only when the value changed: a checkbox
  // always toggles; a radio only when it wasn't already selected. Dispatch each
  // through `withWindowEvent` so happy-dom's missing `window.event` reflects the
  // event being dispatched (as in jsdom/browsers), not the outer click.
  if (input.isConnected && (isCheckbox || !wasChecked)) {
    const fireActivationEvent = (type: "input" | "change") => {
      const activationEvent = createEvent[type](input);
      withWindowEvent(activationEvent, () => fireEvent(input, activationEvent));
    };
    fireActivationEvent("input");
    fireActivationEvent("change");
  }
  return defaultAllowed;
}

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
    const defaultAllowed = withWindowEvent(event, () =>
      fireEventAllowingDisabledClick(element, event),
    );
    await flushMicrotasks();
    return defaultAllowed;
  });
}

// The `@testing-library/dom` event map builds `click` and `contextmenu` from
// `MouseEvent` and has no `auxclick` entry, but Pointer Events defines all three
// as `PointerEvent`, which is what Chromium, Firefox, and WebKit dispatch. Only
// the interface and the pointer members change; `button` and `buttons` keep
// their mouse-event semantics. Replacing the map's `click` entry also drops its
// `button: 0`, which `initMouseEvent` assigns anyway.
// https://www.w3.org/TR/pointerevents/#the-click-auxclick-and-contextmenu-events
const clickFamilyInit = { bubbles: true, cancelable: true, composed: true };

function createNamedEvent(
  eventName: DispatchEventType,
  element: NonNullable<Target>,
  options?: object,
) {
  if (
    eventName === "click" ||
    eventName === "auxClick" ||
    eventName === "contextMenu"
  ) {
    return createEvent(eventName.toLowerCase(), element, options, {
      EventType: "PointerEvent",
      defaultInit: clickFamilyInit,
    });
  }
  return createEvent[eventName](element, options);
}

const eventNames: DispatchEventType[] = [...getKeys(fireEvent), "auxClick"];

const events = eventNames.reduce((events, eventName) => {
  events[eventName] = (element, options) => {
    invariant(element, `Unable to dispatch ${eventName} on null element`);
    const event = createNamedEvent(eventName, element, options);
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
 *
 * `click`, `auxclick`, and `contextmenu` are built as `PointerEvent`, the way
 * browsers dispatch them, so they accept and report pointer properties such as
 * `pointerType`.
 * @returns A promise that resolves to `false` when the event's default action was
 * prevented with `event.preventDefault()`, and `true` otherwise.
 * @example
 * ```ts
 * await dispatch.keyDown(q.textbox(), { key: "Enter" });
 * await dispatch.click(q.button());
 * await dispatch.auxClick(q.link("Ariakit"), { button: 1 });
 * // Fire a custom event instance directly:
 * await dispatch(q.textbox(), new Event("selectstart", { bubbles: true }));
 * ```
 */
export const dispatch = Object.assign(baseDispatch, events);
