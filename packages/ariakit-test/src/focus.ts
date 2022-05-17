import "./mock-get-client-rects";

import { getActiveElement } from "ariakit-utils/dom";
import { isFocusable } from "ariakit-utils/focus";
import { DirtiableElement } from "./__utils";
import { act } from "./act";
import { fireEvent } from "./fire-event";

export function focus(element: Element) {
  if (getActiveElement(element) === element) return;
  if (!isFocusable(element)) return;

  const activeElement = getActiveElement(element) as DirtiableElement | null;

  if (activeElement?.dirty) {
    fireEvent.change(activeElement);
    activeElement.dirty = false;
  }

  act(() => {
    element.focus();
  });
}
