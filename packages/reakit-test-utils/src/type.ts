import { isFocusable, isTextField, warning } from "reakit-utils";
import { DirtiableElement } from "./__utils/types";
import { fireEvent } from "./fireEvent";
import { focus } from "./focus";

import "./mockClientRects";

const charMap: Record<string, string> = {
  "\b": "Backspace"
};

const keyMap: Record<
  string,
  (
    element: HTMLInputElement | HTMLTextAreaElement,
    options: InputEventInit
  ) => string
> = {
  Backspace(element) {
    return element.value.substr(0, element.value.length - 1);
  }
};

export function type(
  text: string,
  element?:
    | (DirtiableElement & (HTMLInputElement | HTMLTextAreaElement))
    | null,
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

  for (const char of text) {
    const key = char in charMap ? charMap[char] : char;
    const value =
      key in keyMap ? keyMap[key](element, options) : `${element.value}${char}`;

    const defaultAllowed = fireEvent.keyDown(element, { key, ...options });

    if (defaultAllowed && !element.readOnly) {
      fireEvent.input(element, { data: char, target: { value }, ...options });
    }

    fireEvent.keyUp(element, { key, ...options });
  }
}
