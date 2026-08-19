import { getKeys, invariant } from "@ariakit/utils";
import type { EventType } from "@testing-library/dom";
import { createEvent, fireEvent } from "@testing-library/dom";
import { initEvent } from "./__init-event.ts";
import {
  flushMicrotasks,
  isHappyDOM,
  withWindowEvent,
  wrapAsync,
} from "./__utils.ts";

type Target = Document | Window | Node | Element | null;

type EventFunction = (element: Target, options?: object) => Promise<boolean>;

type EventsObject = {
  [K in EventType]: EventFunction;
};

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
