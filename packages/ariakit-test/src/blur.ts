import "./polyfills.js";

import { getActiveElement } from "@ariakit/core/utils/dom";
import { flushMicrotasks, wrapAsync } from "./__utils.js";
import type { DirtiableElement } from "./__utils.js";
import { dispatch } from "./dispatch.js";

export function blur(element?: DirtiableElement | null) {
  return wrapAsync(async () => {
    if (element == null) {
      element = document.activeElement;
    }

    if (!element) return;
    if (element.tagName === "BODY") return;
    if (getActiveElement(element) !== element) return;

    if (element.dirty) {
      await dispatch.change(element);
      element.dirty = false;
    }

    if (element instanceof HTMLElement || element instanceof SVGElement) {
      element.blur();
      await flushMicrotasks();
    }
  });
}
