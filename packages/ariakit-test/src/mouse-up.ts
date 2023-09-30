import "./polyfills.js";
import { isVisible } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import { fireEvent } from "./fire-event.js";

export function mouseUp(element: Element | null, options?: MouseEventInit) {
  invariant(element, "Unable to mouseUp on null element");

  if (!isVisible(element)) return;

  const { disabled } = element as HTMLButtonElement;

  fireEvent.pointerUp(element, options);

  // mouseup is not called on disabled elements
  if (disabled) return;

  fireEvent.mouseUp(element, { detail: 1, ...options });
}
