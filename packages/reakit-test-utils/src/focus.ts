import { act, fireEvent } from "./react-testing-library";

export function focus(element: HTMLElement) {
  if (document.activeElement) {
    fireEvent.focusOut(document.activeElement);
  }
  fireEvent.focusIn(element);
  act(() => element.focus());
}
