import { isFocusable, getActiveElement } from "reakit-utils";
import { DirtiableElement } from "./__utils/types";
import { fireEvent } from "./fireEvent";
import { act } from "./act";

import "./mockClientRects";

export function focus(element: Element) {
  if (getActiveElement(element) === element) return;
  if (!isFocusable(element)) return;

  const activeElement = getActiveElement(element) as DirtiableElement | null;

  if (activeElement?.dirty) {
    fireEvent.change(activeElement);
    activeElement.dirty = false;
  }

  act(() => {
    if (element instanceof HTMLElement || element instanceof SVGElement) {
      element.focus();
    }
  });
}
