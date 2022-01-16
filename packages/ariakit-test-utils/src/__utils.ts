import { act } from "./act";

export type DirtiableElement = Element & { dirty?: boolean };

export type TextField = HTMLInputElement | HTMLTextAreaElement;

export function queuedMicrotasks(): Promise<void> {
  return act(() => Promise.resolve());
}

// JSDOM doesn't keep selection range when we delete a selection. We're adding
// a custom property called `selectionRange` to the element so we have control over
// it.
type TextFieldWithSelectionRange = TextField & {
  selectionRange?: [number, number];
};

function setSelectionRangeOnSelect(event: UIEvent) {
  const { target } = event;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  ) {
    const textField = target as TextFieldWithSelectionRange;
    const start = textField.selectionStart || 0;
    const end = textField.selectionEnd || start;
    setSelectionRange(textField, start, end);
  }
}

export function getSelectionRange(element: TextField) {
  const { selectionRange, selectionStart, selectionEnd, value } =
    element as TextFieldWithSelectionRange;
  if (selectionRange) {
    return selectionRange;
  }
  const start = selectionStart || value.length;
  const end = selectionEnd || start;
  return [start, end] as const;
}

export function setSelectionRange(
  element: TextField,
  start: number,
  end = start
) {
  const textField = element as TextFieldWithSelectionRange;
  textField.selectionRange = [start, end];
  textField.addEventListener(
    "select",
    setSelectionRangeOnSelect as EventListenerOrEventListenerObject
  );
}
