import { isVisible, invariant } from "@ariakit/utils";
import { settle, wrapAsync } from "./__utils.ts";
import { dispatch } from "./dispatch.ts";
import { hover } from "./hover.ts";
import { mouseDown } from "./mouse-down.ts";
import { mouseUp } from "./mouse-up.ts";
import { sleep } from "./sleep.ts";

function getHoverOptions(options?: PointerEventInit): PointerEventInit {
  return { ...options, button: 0, buttons: 0 };
}

function getPressOptions(options?: PointerEventInit): PointerEventInit {
  return { ...options, button: 2, buttons: 2 };
}

function getReleaseOptions(options?: PointerEventInit): PointerEventInit {
  return { ...options, button: 2, buttons: 0 };
}

function createAuxClickEvent(element: Element, options: MouseEventInit) {
  const { defaultView } = element.ownerDocument;
  const MouseEventConstructor = defaultView?.MouseEvent ?? MouseEvent;
  return new MouseEventConstructor("auxclick", {
    bubbles: true,
    cancelable: true,
    composed: true,
    detail: 1,
    ...options,
  });
}

/**
 * Right-clicks on an element, simulating the sequence of events a real secondary
 * mouse click produces — hovering the target, then right-button `pointerdown`,
 * `mousedown`, `focus`, `contextmenu`, `pointerup`, `mouseup`, and `auxclick`.
 *
 * Hidden elements are handled the same way a browser would, and no synthetic
 * `click` event is fired. Pass `options` to set event properties such as
 * modifier keys.
 * @example
 * ```ts
 * await rightClick(q.text("Open menu"));
 * ```
 */
export function rightClick(
  element: Element | null,
  options?: PointerEventInit,
) {
  return wrapAsync(async () => {
    invariant(element, "Unable to rightClick on null element");
    if (!isVisible(element)) return;

    await hover(element, getHoverOptions(options));
    const pressOptions = getPressOptions(options);
    await mouseDown(element, pressOptions);

    // The element may be hidden after hover/mouseDown, so we need to check again
    // and find the first visible parent.
    while (!isVisible(element)) {
      if (!element.parentElement) return;
      element = element.parentElement;
    }

    await dispatch.contextMenu(element, pressOptions);
    await settle();

    const releaseOptions = getReleaseOptions(options);

    await mouseUp(element, releaseOptions);
    await dispatch(element, createAuxClickEvent(element, releaseOptions));
    await sleep();
  });
}
