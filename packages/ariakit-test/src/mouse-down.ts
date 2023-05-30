import "./mock-get-client-rects.js";

import { getDocument, isVisible } from "@ariakit/core/utils/dom";
import { getClosestFocusable, isFocusable } from "@ariakit/core/utils/focus";
import { blur } from "./blur.js";
import { fireEvent } from "./fire-event.js";
import { focus } from "./focus.js";

export function mouseDown(element: Element, options?: MouseEventInit) {
  if (!isVisible(element)) return;

  const { disabled } = element as HTMLButtonElement;

  let defaultAllowed = fireEvent.pointerDown(element, options);

  if (!disabled) {
    // Mouse events are not called on disabled elements
    if (!fireEvent.mouseDown(element, { detail: 1, ...options })) {
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
      focus(element);
    } else if (element.parentElement) {
      // If the element is not focusable, focus the closest focusable parent
      const closestFocusable = getClosestFocusable(element.parentElement);
      if (closestFocusable) {
        focus(closestFocusable);
      } else {
        // This will automatically set document.body as the activeElement
        blur();
      }
    }
  }
}
