import { fireEvent } from "./react-testing-library";

export function type(element: Element, text: string) {
  for (let i = 0; i <= text.length; i += 1) {
    const partialText = text.substr(0, i + 1);
    fireEvent.change(element, { target: { value: partialText } });
  }
}
