import "./polyfills.js";
import { isVisible } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import { wrapAsync } from "./__utils.js";
import { dispatch } from "./dispatch.js";

export function mouseUp(element: Element | null, options?: MouseEventInit) {
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
