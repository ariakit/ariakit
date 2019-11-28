import { isFocusable } from "reakit-utils/tabbable";
import { fireEvent } from "./fireEvent";
import { act } from "./act";
import { blur } from "./blur";

export function focus(element: Element) {
  if (element.ownerDocument?.activeElement === element) return;
  if (!isFocusable(element)) return;
  blur();
  act(() => (element as HTMLElement | SVGElement).focus());
  fireEvent.focusIn(element);
}
