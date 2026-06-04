import { getActiveElement, isTextField, isFocusable } from "@ariakit/utils";
import type { DirtiableElement, TextField } from "./__utils.ts";
import { wrapAsync } from "./__utils.ts";
import { dispatch } from "./dispatch.ts";
import { focus } from "./focus.ts";
import { sleep } from "./sleep.ts";

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

/**
 * Types text into an element, simulating a real user pressing each key. Focuses
 * the element, then for each character fires `keydown`, updates the value and
 * caret position of text fields through an `input` event (preceded by `keypress`
 * when inserting a printable character), and fires `keyup`.
 *
 * Special characters map to their keys: `"\b"` is Backspace, `"\x7f"` is Delete,
 * `"\n"` is Enter, and `"\t"` is Tab. When no element is passed, the currently
 * focused element is used. Pass `options` to set event properties such as modifier
 * keys or composition state.
 * @example
 * ```ts
 * await type("Hello", q.textbox());
 * // Delete the last character with a Backspace:
 * await type("\b");
 * ```
 */
export function type(
  text: string,
  element?: (DirtiableElement & HTMLElement) | null,
  options: InputEventInit | KeyboardEventInit = {},
) {
  return wrapAsync(async () => {
    if (element == null) {
      element = document.activeElement as HTMLInputElement;
    }

    if (!element) return;
    if (!isFocusable(element)) return;

    await focus(element);

    // Set element dirty so blur() can dispatch a change event
    element.dirty = true;

    const restoreEmailInput = workAroundEmailInput(element);

    for (const char of text) {
      const key = getKeyFromChar(char);
      let value = "";
      let inputType = options.isComposing
        ? "insertCompositionText"
        : "insertText";
      let defaultAllowed = await dispatch.keyDown(element, { key, ...options });

      // After key down, focus may change and be on a text field, so we get the
      // active element again.
      element = getActiveElement(element) || element;

      if (isTextField(element)) {
        const input = element as TextField;
        const [start, end] = [
          input.selectionStart ?? 0,
          input.selectionEnd ?? 0,
        ];
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
            defaultAllowed = await dispatch.keyPress(input, {
              key,
              charCode: key.charCodeAt(0),
              ...options,
            });
          }
          if (inputType === "insertCompositionText") {
            defaultAllowed = await dispatch.compositionUpdate(input, {
              data: char,
              target: { value },
              ...options,
            });
          }
          if (defaultAllowed) {
            await dispatch.input(input, {
              data: char,
              target: {
                value,
                selectionStart: nextCaretPosition,
                selectionEnd: nextCaretPosition,
              },
              inputType,
              ...options,
            });
          }
        }
      }

      await sleep();

      await dispatch.keyUp(element, { key, ...options });

      await sleep();
    }

    restoreEmailInput();
  });
}
