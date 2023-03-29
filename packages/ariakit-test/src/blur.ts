import { getActiveElement } from "@ariakit/core/utils/dom";
import type { DirtiableElement } from "./__utils.js";
import { act } from "./act.js";
import { fireEvent } from "./fire-event.js";

export function blur(element?: DirtiableElement | null) {
  if (element == null) {
    element = document.activeElement;
  }

  if (!element) return;
  if (element.tagName === "BODY") return;
  if (getActiveElement(element) !== element) return;

  if (element.dirty) {
    fireEvent.change(element);
    element.dirty = false;
  }

  act(() => {
    if (element instanceof HTMLElement || element instanceof SVGElement) {
      element.blur();
    }
  });
}
