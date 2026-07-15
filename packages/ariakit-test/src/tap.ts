import { click } from "./click.ts";

/**
 * Clicks on an element without the brief delay that `click` waits between
 * pressing and releasing, reproducing the timing of a quick tap. It fires the
 * same pointer, mouse, and click events as `click`. Pass `options` to set event
 * properties such as modifier keys.
 * @example
 * ```ts
 * await tap(q.button("Submit"));
 * ```
 */
export function tap(element: Element | null, options?: PointerEventInit) {
  return click(element, options, true);
}
