import { getActiveElement, isFocusable, invariant } from "@ariakit/utils";
import type { DirtiableElement } from "./__utils.ts";
import { flushMicrotasks, wrapAsync } from "./__utils.ts";
import { dispatch } from "./dispatch.ts";

/**
 * Moves focus to an element, simulating a real user focusing it. Elements that
 * aren't focusable are ignored, and focusing the already focused element is a
 * no-op. If another element was typed into since it gained focus, its pending
 * `change` event is dispatched before focus moves.
 * @example
 * ```ts
 * await focus(q.textbox());
 * expect(q.textbox()).toHaveFocus();
 * ```
 */
export function focus(element: Element | null) {
  return wrapAsync(async () => {
    invariant(element, "Unable to focus on null element");
    if (getActiveElement(element) === element) return;
    if (!isFocusable(element)) return;
    const htmlElement = element as HTMLElement;

    const activeElement = getActiveElement(
      htmlElement,
    ) as DirtiableElement | null;

    if (activeElement?.dirty) {
      await dispatch.change(activeElement);
      activeElement.dirty = false;
    }

    htmlElement.focus();
    await flushMicrotasks();
  });
}
