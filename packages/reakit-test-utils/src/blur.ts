import { fireEvent } from "./fireEvent";
import { act } from "./act";

// TODO: Fire change before blur if it's input/textarea/select
export function blur(element?: Element | null) {
  if (element == null) {
    element = document.activeElement;
  }

  if (!element) return;
  if (element instanceof HTMLBodyElement) return;
  if (element.ownerDocument?.activeElement !== element) return;

  act(() => (element as HTMLElement | SVGElement).blur());
  fireEvent.focusOut(element);
}
