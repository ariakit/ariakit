import { getActiveElement } from "ariakit-utils/dom";
import { fireEvent } from "./fire-event";
import { DirtiableElement } from "./__utils";

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

  if (element instanceof HTMLElement || element instanceof SVGElement) {
    element.blur();
  }
}
