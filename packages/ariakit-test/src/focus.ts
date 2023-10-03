import { getActiveElement } from "@ariakit/core/utils/dom";
import { isFocusable } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import { flushMicrotasks, wrapAsync } from "./__utils.js";
import type { DirtiableElement } from "./__utils.js";
import { dispatch } from "./dispatch.js";

export function focus(element: Element | null) {
  return wrapAsync(async () => {
    invariant(element, "Unable to focus on null element");
    if (getActiveElement(element) === element) return;
    if (!isFocusable(element)) return;

    const activeElement = getActiveElement(element) as DirtiableElement | null;

    if (activeElement?.dirty) {
      await dispatch.change(activeElement);
      activeElement.dirty = false;
    }

    element.focus();
    await flushMicrotasks();
  });
}
