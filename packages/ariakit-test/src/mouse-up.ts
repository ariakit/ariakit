import "./polyfills.js";
import { isVisible } from "@ariakit/core/utils/dom";
import { fireEvent } from "./fire-event.js";

export function mouseUp(element: Element, options?: MouseEventInit) {
  if (!isVisible(element)) return;

  const { disabled } = element as HTMLButtonElement;

  fireEvent.pointerUp(element, options);

  // mouseup is not called on disabled elements
  if (disabled) return;

  fireEvent.mouseUp(element, { detail: 1, ...options });
}
