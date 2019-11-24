import { act, fireEvent } from "./react-testing-library";

export function focus(element: Element) {
  if (document.activeElement) {
    fireEvent.focusOut(document.activeElement);
  }
  fireEvent.focusIn(element);
  if (element instanceof HTMLElement || element instanceof SVGElement) {
    act(() => element.focus());
  }
}
