import "./polyfills.js";
import { getKeys, invariant } from "@ariakit/core/utils/misc";
import { createEvent, fireEvent } from "@testing-library/dom";
import type { EventType } from "@testing-library/dom";
import { flushMicrotasks, wrapAsync } from "./__utils.js";

type Target = Document | Window | Node | Element | null;
type EventFunction = (element: Target, options?: object) => Promise<boolean>;
type EventsObject = { [K in EventType]: EventFunction };

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
    return baseDispatch(element, event);
  };
  return events;
}, {} as EventsObject);

export const dispatch = Object.assign(baseDispatch, events);
