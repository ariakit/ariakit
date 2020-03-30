import { isFocusable, getActiveElement } from "reakit-utils";
import { fireEvent } from "./fireEvent";
import { act } from "./act";
import { blur } from "./blur";

import "./mockClientRects";

export function focus(element: Element) {
  if (getActiveElement(element) === element) return;
  if (!isFocusable(element)) return;
  blur();
  act(() => {
    if (element instanceof HTMLElement || element instanceof SVGElement) {
      element.focus();
    }
  });
  fireEvent.focusIn(element);
}
