import "./polyfills.js";
import { getDocument, isVisible } from "@ariakit/core/utils/dom";
import { getClosestFocusable, isFocusable } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import { wrapAsync } from "./__utils.js";
import { blur } from "./blur.js";
import { dispatch } from "./dispatch.js";
import { focus } from "./focus.js";

export function mouseDown(element: Element | null, options?: MouseEventInit) {
  return wrapAsync(async () => {
    invariant(element, "Unable to mouseDown on null element");

    if (!isVisible(element)) return;

    const { disabled } = element as HTMLButtonElement;

    let defaultAllowed = await dispatch.pointerDown(element, options);

    if (!disabled) {
      // Mouse events are not called on disabled elements
      if (!(await dispatch.mouseDown(element, { detail: 1, ...options }))) {
        defaultAllowed = false;
      }
    }

    // Do not enter this if event.preventDefault() has been called on
    // pointerdown or mousedown.
    if (defaultAllowed) {
      // Remove current selection
      const selection = getDocument(element).getSelection();
      if (selection && selection.rangeCount) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          selection.removeAllRanges();
        }
      }
      if (
        isFocusable(element) &&
        getComputedStyle(element).pointerEvents !== "none"
      ) {
        await focus(element);
      } else if (element.parentElement) {
        // If the element is not focusable, focus the closest focusable parent
        const closestFocusable = getClosestFocusable(element.parentElement);
        if (closestFocusable) {
          await focus(closestFocusable);
        } else {
          // This will automatically set document.body as the activeElement
          await blur();
        }
      }
    }
  });
}
