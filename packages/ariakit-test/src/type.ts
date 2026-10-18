import { getActiveElement, isTextField, isFocusable } from "@ariakit/utils";
import type { DirtiableElement, TextField } from "./__utils.ts";
import { settle, wrapAsync } from "./__utils.ts";
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

function getCharCodeFromChar(char: string) {
  if (char === "\n") return 13;
  return char.charCodeAt(0);
}

// Email inputs are not considered text fields. They don't work well with the
// input events dispatched by the type method. So we temporarily make them text
// inputs.
function workAroundEmailInput(element: Element) {
  const input = element as HTMLInputElement;
  if (input.tagName !== "INPUT" || input.type !== "email") return () => {};
  input.type = "text";
  // Email inputs have no selection API. Continue at the end when changing the
  // type resets the caret to the start, as it does in jsdom.
  input.setSelectionRange(input.value.length, input.value.length);
  return () => {
    input.type = "email";
  };
}

/**
 * Types text into an element, simulating a real user pressing each key. Focuses
 * the element, then for each character fires `keydown`, updates the value and
 * caret position of text fields through an `input` event (preceded by
 * `keypress` when inserting a printable character), and fires `keyup`.
 *
 * Special characters map to their keys: `"\b"` is Backspace, `"\x7f"` is
 * Delete, `"\n"` is Enter, and `"\t"` is Tab. When no element is passed, the
 * currently focused element is used. Pass `options` to set event properties
 * such as modifier keys or composition state.
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

    let restoreEmailInput = workAroundEmailInput(element);

    for (const char of text) {
      const key = getKeyFromChar(char);
      let value = "";
      let inputType = options.isComposing
        ? "insertCompositionText"
        : "insertText";
      let defaultAllowed = await dispatch.keyDown(element, { key, ...options });

      // Keydown may move focus; continue typing at the new active element.
      const activeElement: HTMLElement = getActiveElement(element) || element;
      if (activeElement !== element) {
        restoreEmailInput();
        element = activeElement;
        restoreEmailInput = workAroundEmailInput(element);
      }

      if (isTextField(element)) {
        const input = element as DirtiableElement & TextField;
        const [start, end] = [
          input.selectionStart ?? 0,
          input.selectionEnd ?? 0,
        ];
        const collapsed = start === end;
        let nextCaretPosition = start;

        if (char === "\x7f") {
          // Delete removes the selection or the character after the caret.
          const firstPart = input.value.slice(0, start);
          const secondPart = input.value.slice(collapsed ? end + 1 : end);
          value = `${firstPart}${secondPart}`;
          inputType = "deleteContentForward";
        } else if (char === "\b") {
          // Backspace removes the selection or the character before the caret.
          nextCaretPosition = collapsed ? Math.max(start - 1, 0) : start;
          const firstPart = input.value.slice(0, nextCaretPosition);
          const lastPart = input.value.slice(end, input.value.length);
          value = `${firstPart}${lastPart}`;
          inputType = "deleteContentBackward";
        } else {
          // Insert at the caret, replacing the selection or prior composition.
          const firstPartEnd = options.isComposing ? start - 1 : start;
          const firstPart = input.value.slice(0, firstPartEnd);
          const lastPart = input.value.slice(end, input.value.length);
          // Selection offsets count UTF-16 code units, and `char` holds both
          // surrogates of an astral character such as an emoji.
          nextCaretPosition = options.isComposing
            ? start + 1
            : start + char.length;
          value = `${firstPart}${char}${lastPart}`;
        }

        // Capture this before dispatch.compositionUpdate(), which applies
        // target.value when creating the event.
        const valueChanged = value !== input.value;

        // Deleting at a boundary does not fire input. Replacing selected text
        // with identical text still does, even though the value is unchanged.
        const noOpDeletion =
          !valueChanged &&
          (inputType === "deleteContentForward" ||
            inputType === "deleteContentBackward");

        if (defaultAllowed && !input.readOnly && !noOpDeletion) {
          if (inputType === "insertText") {
            defaultAllowed = await dispatch.keyPress(input, {
              key,
              charCode: getCharCodeFromChar(char),
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
            if (valueChanged) {
              input.dirty = true;
            }
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

      // Between keystrokes the component only needs its microtask/rAF-scheduled
      // work to flush (e.g. a controlled input re-render, combobox re-target),
      // so a cheap settle keeps typing fast without a per-character wall delay.
      await settle();

      await dispatch.keyUp(element, { key, ...options });

      await settle();
    }

    restoreEmailInput();

    // One real settle after the whole sequence, in case a component reacts to
    // the completed input on a wall-clock timer.
    await sleep();
  });
}
