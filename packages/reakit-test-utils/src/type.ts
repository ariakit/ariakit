import { isFocusable, warning } from "reakit-utils";
import { fireEvent } from "./fireEvent";
import { focus } from "./focus";
import { DirtiableElement } from "./__types";
import { subscribeDefaultPrevented } from "./__utils";

type TypeableElement = DirtiableElement &
  (HTMLInputElement | HTMLTextAreaElement);

const charMap: Record<string, string> = {
  "\b": "Backspace"
};

const keyMap: Record<
  string,
  (element: TypeableElement, options: InputEventInit) => string
> = {
  Backspace(element) {
    return element.value.substr(0, element.value.length - 1);
  }
};

function isTypeable(element: Element): element is TypeableElement {
  if (element.tagName === "TEXTAREA") return true;

  const typeableInputTypes = [
    "email",
    "number",
    "password",
    "search",
    "tel",
    "text",
    "url"
  ];

  return (
    element instanceof HTMLInputElement &&
    typeableInputTypes.includes(element.type)
  );
}

export function type(
  text: string,
  element?: DirtiableElement | null,
  options: InputEventInit = {}
) {
  if (element == null) {
    element = document.activeElement;
  }

  if (!element || !isFocusable(element)) return;

  if (!isTypeable(element)) {
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

    const defaultPrevented = subscribeDefaultPrevented(element, "keydown");

    fireEvent.keyDown(element, { key, ...options });

    if (!defaultPrevented.current && !element.readOnly) {
      fireEvent.input(element, { data: char, target: { value }, ...options });
    }

    fireEvent.keyUp(element, { key, ...options });

    defaultPrevented.unsubscribe();
  }
}
