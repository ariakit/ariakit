import { fireEvent } from "./react-testing-library";

export function type(
  text: string,
  element?: Element | null,
  options: InputEventInit = {}
) {
  if (element == null) {
    element = document.activeElement || document.body;
  }

  if (!element) return;

  for (let i = 0; i < text.length; i += 1) {
    const data = text[i];
    const partialText = text.substr(0, i + 1);
    const value =
      element instanceof HTMLInputElement
        ? `${element.value}${data}`
        : partialText;
    fireEvent.input(element, {
      data,
      inputType: "insertText",
      target: { value },
      ...options
    });
  }
}

type.Backspace = (
  times = 1,
  element?: Element | null,
  options: InputEventInit = {}
) => {
  if (element == null) {
    element = document.activeElement || document.body;
  }

  if (!element) return;

  for (let i = 0; i < times; i += 1) {
    const value =
      element instanceof HTMLInputElement
        ? element.value.substr(0, element.value.length - 1)
        : "";
    fireEvent.input(element, {
      inputType: "deleteContentBackward",
      target: { value },
      ...options
    });
  }
};
