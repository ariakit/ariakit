import "./mock-get-client-rects";

import { getClosestFocusable, isFocusable } from "ariakit-utils/focus";
import { blur } from "./blur";
import { fireEvent } from "./fire-event";
import { focus } from "./focus";

export function mouseDown(element: Element, options?: MouseEventInit) {
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
