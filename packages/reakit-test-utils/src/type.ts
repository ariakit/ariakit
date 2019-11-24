import { fireEvent } from "./react-testing-library";

export function type(text: string, element?: Element | null) {
  if (element == null) {
    element = document.activeElement || document.body;
  }

  if (!element) return;

  for (let i = 0; i <= text.length; i += 1) {
    const partialText = text.substr(0, i + 1);
    fireEvent.input(element, { target: { value: partialText } });
  }
}
