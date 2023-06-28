import "./polyfills.js";
import { getActiveElement, isTextField } from "@ariakit/core/utils/dom";
import { isFocusable } from "@ariakit/core/utils/focus";
import type { DirtiableElement, TextField } from "./__utils.js";
import { queuedMicrotasks } from "./__utils.js";
import { fireEvent } from "./fire-event.js";
import { focus } from "./focus.js";
import { sleep } from "./sleep.js";

function getKeyFromChar(key: string) {
  if (key === "\x7f") return "Delete";
  if (key === "\b") return "Backspace";
  if (key === "\n") return "Enter";
  if (key === "\t") return "Tab";
  return key;
}

// Email inputs are not considered text fields. They don't work well with the
// input events dispatched by the type method. So we temporarily make them text
// inputs.
function workAroundEmailInput(element: Element) {
  const input = element as HTMLInputElement;
  if (input.tagName !== "INPUT" || input.type !== "email") return () => {};
  input.type = "text";
  return () => {
    input.type = "email";
  };
}

export async function type(
  text: string,
  element?: (DirtiableElement & HTMLElement) | null,
  options: InputEventInit | KeyboardEventInit = {}
) {
  if (element == null) {
    element = document.activeElement as HTMLInputElement;
  }

  if (!element) return;
  if (!isFocusable(element)) return;

  focus(element);

  // Set element dirty so blur() can dispatch a change event
  element.dirty = true;

  const restoreEmailInput = workAroundEmailInput(element);

  for (const char of text) {
    const key = getKeyFromChar(char);
    let value = "";
    let inputType = options.isComposing
      ? "insertCompositionText"
      : "insertText";
    let defaultAllowed = fireEvent.keyDown(element, { key, ...options });

    await queuedMicrotasks();

    // After key down, focus may change and be on a text field, so we get the
    // active element again.
    element = (getActiveElement(element) || element) as HTMLElement;

    if (isTextField(element)) {
      const input = element as TextField;
      const [start, end] = [input.selectionStart ?? 0, input.selectionEnd ?? 0];
      const collapsed = start === end;
      let nextCaretPosition = start;

      if (char === "\x7f") {
        // Delete key
        const firstPart = input.value.slice(0, start);
        const secondPart = input.value.slice(collapsed ? end + 1 : end);
        value = `${firstPart}${secondPart}`;
        inputType = "deleteContentForward";
      } else if (char === "\b") {
        // Backspace. If there's no selection (that is, the caret start position
        // is the same as the end position), then we decrement the position so
        // it deletes the previous character.
        nextCaretPosition = collapsed ? Math.max(start - 1, 0) : start;
        const firstPart = input.value.slice(0, nextCaretPosition);
        const lastPart = input.value.slice(end, input.value.length);
        value = `${firstPart}${lastPart}`;
        inputType = "deleteContentBackward";
      } else {
        // Any other character. Just get the caret position and add the
        // character there.
        const firstPartEnd = options.isComposing ? start - 1 : start;
        const firstPart = input.value.slice(0, firstPartEnd);
        const lastPart = input.value.slice(end, input.value.length);
        nextCaretPosition = start + 1;
        value = `${firstPart}${char}${lastPart}`;
      }

      if (defaultAllowed && !input.readOnly) {
        if (inputType === "insertText") {
          defaultAllowed = fireEvent.keyPress(input, {
            key,
            charCode: key.charCodeAt(0),
            ...options,
          });
        }
        if (inputType === "insertCompositionText") {
          defaultAllowed = fireEvent.compositionUpdate(input, {
            data: char,
            target: { value },
            ...options,
          });
        }
        if (defaultAllowed) {
          fireEvent.input(input, {
            data: char,
            target: {
              value,
              selectionStart: nextCaretPosition,
              selectionEnd: nextCaretPosition,
            },
            inputType,
            ...options,
          });
          // Need to re-assign the selection state for React 17 and/or React
          // Testing Library 12 (not sure which).
          if (input.selectionStart !== nextCaretPosition) {
            input.setSelectionRange(nextCaretPosition, nextCaretPosition);
          }
        }
      }
    }

    await sleep();

    fireEvent.keyUp(element, { key, ...options });

    await sleep();
  }

  restoreEmailInput();
}
