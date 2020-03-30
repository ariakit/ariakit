import { getActiveElement } from "reakit-utils";
import { warning } from "reakit-warning";
import { DirtiableElement } from "./__utils/types";
import { fireEvent } from "./fireEvent";
import { act } from "./act";

export function blur(element?: DirtiableElement | null) {
  if (element == null) {
    element = document.activeElement;
  }

  if (!element) return;
  if (element.tagName === "BODY") return;
  if (getActiveElement(element) !== element) {
    warning(
      true,
      "[reakit-test-utils/blur]",
      "You're trying to blur() an element that is not focused. Please call focus(element) first."
    );
    return;
  }

  if (element.dirty) {
    fireEvent.change(element);
    element.dirty = false;
  }

  act(() => {
    if (element instanceof HTMLElement || element instanceof SVGElement) {
      element.blur();
    }
  });
  fireEvent.focusOut(element);
}
