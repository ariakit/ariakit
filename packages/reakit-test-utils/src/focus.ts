import { isFocusable } from "reakit-utils";
import { fireEvent } from "./fireEvent";
import { act } from "./act";
import { blur } from "./blur";

export function focus(element: Element) {
  if (element.ownerDocument?.activeElement === element) return;
  if (!isFocusable(element)) return;
  blur();
  act(() => {
    if (element instanceof HTMLElement || element instanceof SVGElement) {
      element.focus();
    }
  });
  fireEvent.focusIn(element);
}
