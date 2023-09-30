import "./polyfills.js";

import { getActiveElement } from "@ariakit/core/utils/dom";
import { isFocusable } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import type { DirtiableElement } from "./__utils.js";
import { act } from "./act.js";
import { fireEvent } from "./fire-event.js";

export function focus(element: Element | null) {
  invariant(element, "Unable to focus on null element");

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
