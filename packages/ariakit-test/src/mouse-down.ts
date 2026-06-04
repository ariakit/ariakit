import {
  getDocument,
  isVisible,
  getClosestFocusable,
  isFocusable,
  invariant,
} from "@ariakit/utils";
import { wrapAsync } from "./__utils.ts";
import { blur } from "./blur.ts";
import { dispatch } from "./dispatch.ts";
import { focus } from "./focus.ts";

/**
 * Presses the primary pointer button down on an element, firing `pointerdown` and
 * `mousedown` and moving focus the way a browser would. Disabled elements still
 * receive `pointerdown` but not `mousedown`, and focus falls back to the closest
 * focusable ancestor when the target itself isn't focusable. This is one step of a
 * full `click`; use it directly to test press-and-hold behavior. Pass `options` to
 * set event properties such as modifier keys.
 * @example
 * ```ts
 * await mouseDown(q.button("Resize"));
 * // ...assert the press state, then release:
 * await mouseUp(q.button("Resize"));
 * ```
 */
export function mouseDown(element: Element | null, options?: PointerEventInit) {
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
      if (selection?.rangeCount) {
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
