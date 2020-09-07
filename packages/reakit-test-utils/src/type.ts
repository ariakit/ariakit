import { isFocusable, isTextField } from "reakit-utils";
import { warning } from "reakit-warning";
import { DirtiableElement, TextField } from "./__utils/types";
import { fireEvent } from "./fireEvent";
import { focus } from "./focus";
import { getSelectionRange, setSelectionRange } from "./__utils/selectionRange";

import "./mockClientRects";

export function type(
  text: string,
  element?: (DirtiableElement & HTMLElement) | null,
  options: InputEventInit = {}
) {
  if (element == null) {
    element = document.activeElement as HTMLInputElement;
  }

  if (!element || !isFocusable(element)) return;

  if (!isTextField(element)) {
    warning(
      true,
      "[reakit-test-utils/type]",
      "You're trying to type on an element that is not able of being typed on a keyboard."
    );
    return;
  }

  focus(element);

  // Set element dirty so blur() can dispatch a change event
  element.dirty = true;

  const input = element as TextField;

  for (const char of text) {
    let key = char;
    let value = "";
    let inputType = "insertText";
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
      key = "Backspace";
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

    let defaultAllowed = fireEvent.keyDown(input, { key, ...options });

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

    fireEvent.keyUp(input, { key, ...options });
  }
}
