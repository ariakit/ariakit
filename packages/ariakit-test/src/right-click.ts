import { click } from "./click.ts";

/**
 * Right-clicks on an element, simulating the sequence of events a real secondary
 * mouse click produces — hovering the target, then right-button `pointerdown`,
 * `mousedown`, `focus`, `contextmenu`, `pointerup`, `mouseup`, and `auxclick`.
 *
 * Hidden elements are handled the same way a browser would, and no synthetic
 * `click` event is fired. Pass `options` to set event properties such as
 * modifier keys.
 * @example
 * ```ts
 * await rightClick(q.text("Open menu"));
 * ```
 */
export function rightClick(
  element: Element | null,
  options?: PointerEventInit,
) {
  return click(element, { ...options, button: 2 });
}
