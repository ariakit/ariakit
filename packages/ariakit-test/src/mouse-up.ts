import { fireEvent } from "./fire-event";

export function mouseUp(element: Element, options?: MouseEventInit) {
  const { disabled } = element as HTMLButtonElement;

  fireEvent.pointerUp(element, options);

  // mouseup is not called on disabled elements
  if (disabled) return;

  fireEvent.mouseUp(element, { detail: 1, ...options });
}
