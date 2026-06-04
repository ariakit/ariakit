import { getActiveElement } from "@ariakit/utils";
import type { DirtiableElement } from "./__utils.ts";
import { flushMicrotasks, wrapAsync } from "./__utils.ts";
import { dispatch } from "./dispatch.ts";

/**
 * Removes focus from an element, simulating a real user moving focus away from
 * it. When no element is passed, the currently focused element
 * (`document.activeElement`) is used. If the element was typed into since it
 * gained focus, a `change` event is dispatched before it's blurred.
 * @example
 * ```ts
 * await type("hello", q.textbox());
 * // Dispatches the pending `change` event, then blurs the textbox.
 * await blur();
 * ```
 */
export function blur(element?: DirtiableElement | null) {
  return wrapAsync(async () => {
    if (element == null) {
      element = document.activeElement;
    }

    if (!element) return;
    if (element.tagName === "BODY") return;
    if (getActiveElement(element) !== element) return;

    if (element.dirty) {
      await dispatch.change(element);
      element.dirty = false;
    }

    if (element instanceof HTMLElement || element instanceof SVGElement) {
      element.blur();
      await flushMicrotasks();
    }
  });
}
