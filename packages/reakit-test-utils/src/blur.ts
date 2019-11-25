import { act, fireEvent } from "./react-testing-library";

export function blur(element?: Element | null) {
  if (element == null) {
    element = document.activeElement || document.body;
  }

  if (!element) return;

  fireEvent.focusOut(element);

  if (
    document.activeElement === element &&
    (element instanceof HTMLElement || element instanceof SVGElement)
  ) {
    const el = element;
    act(() => el.blur());
  } else {
    fireEvent.blur(element);
  }
}
