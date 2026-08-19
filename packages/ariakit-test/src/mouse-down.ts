import {
  getDocument,
  isVisible,
  getClosestFocusable,
  isFocusable,
  isTextbox,
  invariant,
} from "@ariakit/utils";
import { getPressOptions } from "./__mouse.ts";
import { setPreventMouseEvents, wrapAsync } from "./__utils.ts";
import { blur } from "./blur.ts";
import { dispatch } from "./dispatch.ts";
import { focus } from "./focus.ts";

const selectionClearingInputTypes = [
  "date",
  "datetime-local",
  "email",
  "month",
  "number",
  "password",
  "search",
  "tel",
  "text",
  "time",
  "url",
  "week",
];

function preservesSelectionOnMouseDown(element: Element) {
  const control = element.closest("button,input,select,a[href]");
  if (control instanceof HTMLButtonElement) return true;
  if (control instanceof HTMLSelectElement) return true;
  if (control?.tagName.toLowerCase() === "a") return true;
  if (control instanceof HTMLInputElement) {
    return !selectionClearingInputTypes.includes(control.type);
  }
  return false;
}

function shouldClearSelection(element: Element) {
  if (element instanceof HTMLElement && isTextbox(element)) {
    return true;
  }
  return !preservesSelectionOnMouseDown(element);
}

/**
 * Presses a pointer button down on an element, firing `pointerdown` and
 * `mousedown` and moving focus the way a browser would. Disabled elements still
 * receive `pointerdown` but not `mousedown`, and focus falls back to the closest
 * focusable ancestor when the target itself isn't focusable.
 *
 * This is one step of a full `click`; use it directly to test press-and-hold
 * behavior. Pass `options` to set event properties such as modifier keys, or
 * `button` to press another mouse button. The events report the pressed button
 * in `buttons`, like a browser does, unless you pass `buttons` yourself to
 * describe a chorded gesture.
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
    const pressOptions = getPressOptions(options);

    const pointerDefaultAllowed = await dispatch.pointerDown(
      element,
      pressOptions,
    );
    setPreventMouseEvents(getDocument(element), !pointerDefaultAllowed);

    let defaultAllowed = pointerDefaultAllowed;

    // Disabled controls and canceled pointerdown suppress compatibility
    // mousedown.
    if (!disabled && pointerDefaultAllowed) {
      if (
        !(await dispatch.mouseDown(element, { detail: 1, ...pressOptions }))
      ) {
        defaultAllowed = false;
      }
    }

    if (defaultAllowed) {
      const selection = getDocument(element).getSelection();
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed && shouldClearSelection(element)) {
          selection.removeAllRanges();
        }
      }
      if (
        isFocusable(element) &&
        getComputedStyle(element).pointerEvents !== "none"
      ) {
        await focus(element);
      } else if (element.parentElement) {
        const closestFocusable = getClosestFocusable(element.parentElement);
        if (closestFocusable) {
          await focus(closestFocusable);
        } else {
          await blur();
        }
      }
    }
  });
}
