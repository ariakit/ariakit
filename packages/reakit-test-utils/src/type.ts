import { isFocusable, isTextField } from "reakit-utils";
import { warning } from "reakit-warning";
import { DirtiableElement } from "./__utils/types";
import { fireEvent } from "./fireEvent";
import { focus } from "./focus";

import "./mockClientRects";

const charMap: Record<string, string> = {
  "\b": "Backspace",
};

const keyMap: Record<
  string,
  (element: HTMLElement, options: InputEventInit) => string
> = {
  Backspace(element) {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      return element.value.substr(0, element.value.length - 1);
    }
    return "";
  },
};

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

  const input = element as HTMLInputElement | HTMLTextAreaElement;

  for (const char of text) {
    const key = char in charMap ? charMap[char] : char;
    const value =
      key in keyMap ? keyMap[key](input, options) : `${input.value}${char}`;

    const defaultAllowed = fireEvent.keyDown(input, { key, ...options });

    if (defaultAllowed && !input.readOnly) {
      fireEvent.input(input, { data: char, target: { value }, ...options });
    }

    fireEvent.keyUp(input, { key, ...options });
  }
}
