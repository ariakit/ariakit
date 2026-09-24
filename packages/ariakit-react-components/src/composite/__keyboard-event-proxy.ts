import { getWindow } from "@ariakit/utils";

// Maps each keyboard event that Composite dispatches again on its active item
// to the event the user triggered, so components that receive both, like Dialog
// on Escape, can handle them as one key press.
const sourceEvents = new WeakMap<Event, Event>();

/**
 * Dispatches a copy of a keyboard event on an element and records the event it
 * copies as its source. Returns whether the copy's default action was not
 * prevented.
 */
export function fireProxiedKeyboardEvent(
  element: Element,
  source: Event,
  eventInit?: KeyboardEventInit,
) {
  const { KeyboardEvent } = getWindow(element);
  const event = new KeyboardEvent(source.type, eventInit);
  sourceEvents.set(event, getKeyboardEventSource(source));
  return element.dispatchEvent(event);
}

/**
 * Returns the event that the user triggered for a keyboard event that Composite
 * dispatched again, or the event itself.
 */
export function getKeyboardEventSource(event: Event) {
  return sourceEvents.get(event) ?? event;
}
