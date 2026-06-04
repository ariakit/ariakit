import { isVisible, invariant } from "@ariakit/utils";
import { wrapAsync } from "./__utils.ts";
import { dispatch } from "./dispatch.ts";

/**
 * Releases the primary pointer button on an element, firing `pointerup` and
 * `mouseup`. Disabled elements still receive `pointerup` but not `mouseup`.
 *
 * This is the counterpart to `mouseDown` and one step of a full `click`. Pass
 * `options` to set event properties such as modifier keys.
 * @example
 * ```ts
 * await mouseDown(q.button("Resize"));
 * await mouseUp(q.button("Resize"));
 * ```
 */
export function mouseUp(element: Element | null, options?: PointerEventInit) {
  return wrapAsync(async () => {
    invariant(element, "Unable to mouseUp on null element");

    if (!isVisible(element)) return;

    const { disabled } = element as HTMLButtonElement;

    await dispatch.pointerUp(element, options);

    // mouseup is not called on disabled elements
    if (disabled) return;

    await dispatch.mouseUp(element, { detail: 1, ...options });
  });
}
