import { isFocusable, warning } from "reakit-utils";
import { subscribeDefaultPrevented } from "./__utils/subscribeDefaultPrevented";
import { DirtiableElement } from "./__utils/types";
import { fireEvent } from "./fireEvent";
import { focus } from "./focus";

import "./mockClientRects";

type TextField = DirtiableElement & (HTMLInputElement | HTMLTextAreaElement);

const charMap: Record<string, string> = {
  "\b": "Backspace"
};

const keyMap: Record<
  string,
  (element: TextField, options: InputEventInit) => string
> = {
  Backspace(element) {
    return element.value.substr(0, element.value.length - 1);
  }
};

function isTextField(element: Element): element is TextField {
  try {
    const isTextInput =
      element instanceof HTMLInputElement && element.selectionStart !== null;
    const isContentEditable =
      element instanceof HTMLElement && Boolean(element.contentEditable);
    const isTextArea = element.tagName === "TEXTAREA";

    return isTextInput || isContentEditable || isTextArea;
  } catch (error) {
    // Safari throws an exception when trying to get `selectionStart`
    // on non-text <input> elements (which, understandably, don't
    // have the text selection API). We catch this via a try/catch
    // block, as opposed to a more explicit check of the element's
    // input types, because of Safari's non-standard behavior. This
    // also means we don't have to worry about the list of input
    // types that support `selectionStart` changing as the HTML spec
    // evolves over time.
    return false;
  }
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

    const defaultPrevented = subscribeDefaultPrevented(element, "keydown");

    fireEvent.keyDown(element, { key, ...options });

    if (!defaultPrevented.current && !element.readOnly) {
      fireEvent.input(element, { data: char, target: { value }, ...options });
    }

    fireEvent.keyUp(element, { key, ...options });

    defaultPrevented.unsubscribe();
  }
}
