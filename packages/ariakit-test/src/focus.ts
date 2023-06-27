import "./polyfills.js";

import { getActiveElement } from "@ariakit/core/utils/dom";
import { isFocusable } from "@ariakit/core/utils/focus";
import type { DirtiableElement } from "./__utils.js";
import { act } from "./act.js";
import { fireEvent } from "./fire-event.js";

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
