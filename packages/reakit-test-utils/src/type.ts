import { isFocusable, isTextField } from "reakit-utils";
import { warning } from "reakit-warning";
import { DirtiableElement } from "./__utils/types";
import { fireEvent } from "./fireEvent";
import { focus } from "./focus";

import "./mockClientRects";

type TextField = HTMLInputElement | HTMLTextAreaElement;
type TextFieldWithCaretRange = TextField & { caretRange?: [number, number] };

function onSelect(event: UIEvent) {
  const { target } = event;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    const input = target as TextFieldWithCaretRange;
    setCaretRange(input, input.selectionStart!, input.selectionEnd!);
  }
}

function getCaretRange(element: TextFieldWithCaretRange): [number, number] {
  if (element.caretRange) {
    return element.caretRange;
  }
  const { value, selectionStart, selectionEnd } = element;
  return [selectionStart || value.length, selectionEnd || value.length];
}

function setCaretRange(
  element: TextFieldWithCaretRange,
  start: number,
  end = start
) {
  element.caretRange = [start, end];
}

function addTextToSelection(
  element: HTMLInputElement | HTMLTextAreaElement,
  text = ""
) {
  const [start, end] = getCaretRange(element);
  const firstPart = element.value.slice(0, start);
  const lastPart = element.value.slice(end, element.value.length);
  if (start !== end) {
    setCaretRange(element, start + 1);
  }
  return `${firstPart}${text}${lastPart}`;
}

const charMap: Record<string, string> = {
  "\b": "Backspace",
};

const keyMap: Record<
  string,
  (
    element: HTMLInputElement | HTMLTextAreaElement,
    char: string
  ) => { value: string; inputType: string }
> = {
  Backspace(element) {
    const [start, end] = getCaretRange(element);
    const caretStart = start === end ? Math.max(start - 1, 0) : start;
    const firstPart = element.value.slice(0, caretStart);
    const lastPart = element.value.slice(end, element.value.length);
    if (start !== end) {
      setCaretRange(element, caretStart);
    }
    return {
      inputType: "deleteContentBackward",
      value: `${firstPart}${lastPart}`,
    };
  },

  other(element, char) {
    return {
      inputType: "insertText",
      value: addTextToSelection(element, char),
    };
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
  input.addEventListener("select", onSelect);

  for (const char of text) {
    const key = char in charMap ? charMap[char] : char;
    const { inputType, value } = keyMap[key in keyMap ? key : "other"](
      input,
      char
    );

    const defaultAllowed = fireEvent.keyDown(input, { key, ...options });

    if (defaultAllowed && !input.readOnly) {
      fireEvent.input(input, {
        data: char,
        target: { value },
        inputType,
        ...options,
      });
    }

    fireEvent.keyUp(input, { key, ...options });
  }
}
