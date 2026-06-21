// Part of this code is based on https://github.com/testing-library/user-event/blob/d7483f049a1ec2ebf1ca1e2c1f4367849fca5997/src/event/createEvent.ts
import { getKeys, invariant } from "@ariakit/utils";
import type { EventType } from "@testing-library/dom";
import { createEvent, fireEvent } from "@testing-library/dom";
import { flushMicrotasks, isHappyDOM, wrapAsync } from "./__utils.ts";

// happy-dom doesn't implement the legacy `window.event` global, while jsdom and
// real browsers expose the event currently being dispatched there for the
// synchronous duration of the dispatch. React 18 reads `window.event` in
// `getCurrentEventPriority` to classify an update triggered synchronously inside
// a native event listener: a `click`/`keydown` yields DiscreteEventPriority
// (sync lane, flushed in a microtask), whereas a missing `window.event` falls
// back to DefaultEventPriority (default lane, flushed a macrotask later through
// the scheduler). That later flush lets a microtask-coalesced store batch run
// before React commits — e.g. a controlled `<Dialog open>` re-applies its stale
// `open` prop right after `store.hide()`, transiently re-opening the dialog and
// corrupting focus restoration on outside-click. Mirror jsdom by exposing the
// dispatched event on `window.event` only while listeners run, then restoring
// the previous value — or removing the property again when the environment had
// none — so nested dispatches stay correct and the global isn't left behind. In
// practice this only changes the React 18 suite: the controlled-dialog focus
// divergence it fixes doesn't reproduce under React 19.
function withWindowEvent<T>(event: Event, run: () => T): T {
  if (!isHappyDOM) return run();
  const win = window as unknown as { event?: Event };
  const had = Object.prototype.hasOwnProperty.call(win, "event");
  const previous = win.event;
  win.event = event;
  try {
    return run();
  } finally {
    if (had) {
      win.event = previous;
    } else {
      delete win.event;
    }
  }
}

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
  { key, code, location, repeat, isComposing, charCode }: KeyboardEventInit,
) {
  assignProps(event, {
    key: String(key),
    code: String(code),
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

// happy-dom drops a `click` dispatched on a disabled `<button>`/`<input>`: their
// per-class `dispatchEvent` returns `false` before invoking any listener or
// running the control's activation behavior (capricorn86/happy-dom#2190). The
// HTML spec only bars clicks queued from user interaction on a disabled control,
// not a scripted `dispatchEvent` — so jsdom and real browsers still run the
// listeners *and* the activation behavior (a disabled checkbox/radio toggles).
// Reinstate both for the events `@ariakit/test` dispatches. Scoping it here means
// happy-dom's own internal click re-dispatches (e.g. a label forwarding to its
// control) still drop on a disabled control — `click` relies on that to avoid a
// double click.
function fireEventAllowingDisabledClick(
  element: NonNullable<Target>,
  event: Event,
) {
  if (
    isHappyDOM &&
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

// Collect the radios whose checked state to snapshot before selecting `radio`, so
// the activation's effect can be detected and reverted. Selecting a radio unchecks
// a same-name peer through happy-dom's `checked` setter, scoped to the control's
// form or, lacking one, the root node. Snapshotting every same-name radio in the
// root node is a superset of whatever that setter unchecks, so the post-selection
// diff captures exactly the peer that changed regardless of how happy-dom scopes
// the group — including radios linked to a form by the `form` attribute, where
// happy-dom's scope diverges from `radio.form`. `getRootNode()` returns a
// `ParentNode` (the document, a shadow root, or a detached tree root).
function getRadioGroup(radio: HTMLInputElement) {
  if (!radio.name) return [radio];
  const root = radio.getRootNode() as ParentNode;
  const radios = Array.from(
    root.querySelectorAll<HTMLInputElement>("input[type='radio']"),
  ).filter((control) => control.name === radio.name);
  return radios.includes(radio) ? radios : [radio, ...radios];
}

// Run the listeners and reinstate the checkbox/radio activation happy-dom skips
// for a click on a disabled control, mirroring the spec ordering real browsers
// follow. The listeners run through the base `EventTarget` dispatch, which skips
// happy-dom's disabled short-circuit and keeps `disabled` reading `true`
// throughout. A checkbox is toggled (and a radio selected) *before* the click is
// dispatched so listeners observe the new `checked` value; `preventDefault()`
// reverts it. Selecting a radio also unchecks a peer, so the controls the
// activation actually changed are captured and only those are reverted — leaving
// any control a listener changes during the click untouched, as in a browser.
// When not prevented, `input`/`change` fire for the value that changed.
// Submit/reset controls have no such activation (and real browsers don't
// submit/reset a disabled control), so they only run their listeners.
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
