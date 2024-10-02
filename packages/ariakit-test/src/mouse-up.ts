import { isVisible } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import { wrapAsync } from "./__utils.ts";
import { dispatch } from "./dispatch.ts";

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
