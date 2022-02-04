import "./__mock-get-client-rects";

import { getActiveElement, isTextField } from "ariakit-utils/dom";
import { isFocusable } from "ariakit-utils/focus";
import {
  DirtiableElement,
  TextField,
  getSelectionRange,
  queuedMicrotasks,
  setSelectionRange,
} from "./__utils";
import { fireEvent } from "./fire-event";
import { focus } from "./focus";
import { sleep } from "./sleep";

export async function type(
  text: string,
  element?: (DirtiableElement & HTMLElement) | null,
  options: InputEventInit | KeyboardEventInit = {}
) {
  if (element == null) {
    element = document.activeElement as HTMLInputElement;
  }

  if (!element || !isFocusable(element)) return;

  focus(element);

  // Set element dirty so blur() can dispatch a change event
  element.dirty = true;

  for (const char of text) {
    const key = char === "\b" ? "Backspace" : char === "\n" ? "Enter" : char;
    let value = "";
    let inputType = "insertText";
    let defaultAllowed = fireEvent.keyDown(element, { key, ...options });

    await queuedMicrotasks();

    // After key down, focus may change and be on a text field, so we get the
    // active element again.
    element = (getActiveElement(element) || element) as HTMLElement;

    if (!isTextField(element)) return;

    const input = element as TextField;
    const [start, end] = getSelectionRange(input);

    if (char === "\b") {
      // Backspace. If there's no selection (that is, the caret start position
      // is the same as the end position), then we decrement the position so
      // it deletes the previous character.
      const startAfterBackspace =
        start === end ? Math.max(start - 1, 0) : start;
      const firstPart = input.value.slice(0, startAfterBackspace);
      const lastPart = input.value.slice(end, input.value.length);
      setSelectionRange(input, startAfterBackspace);
      value = `${firstPart}${lastPart}`;
      inputType = "deleteContentBackward";
    } else {
      // Any other character. Just get the caret position and add the character
      // there.
      const firstPart = input.value.slice(0, start);
      const lastPart = input.value.slice(end, input.value.length);
      // Increment caret position
      setSelectionRange(input, start + 1);
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
      if (defaultAllowed) {
        fireEvent.input(input, {
          data: char,
          target: { value },
          inputType,
          ...options,
        });
      }
    }

    await sleep();

    fireEvent.keyUp(input, { key, ...options });

    await sleep();
  }
}
