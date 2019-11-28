import { isFocusable, getClosestFocusable, closest } from "reakit-utils";
import { fireEvent } from "./fireEvent";
import { focus } from "./focus";
import { hover } from "./hover";
import { blur } from "./blur";
import { trackEvents } from "./__utils";

// https://twitter.com/diegohaz/status/1176998102139572225
function shouldBlurRightAfterFocus(element: Element) {
  const { userAgent } = navigator;
  const is = (string: string) => userAgent.indexOf(string) !== -1;
  const isLikeMac = is("Mac") || is("like Mac");
  const isSafariOrFirefox = is("Safari") || is("Firefox");
  const isBlurrableElement =
    element instanceof HTMLButtonElement ||
    (element instanceof HTMLInputElement &&
      ["button", "submit", "reset", "checkbox", "radio"].includes(
        element.type
      ));
  return isLikeMac && isSafariOrFirefox && isBlurrableElement;
}

function getClosestLabel(element: Element) {
  if (
    !(element instanceof HTMLInputElement) &&
    !(element instanceof HTMLTextAreaElement) &&
    !(element instanceof HTMLSelectElement)
  ) {
    return closest(element, "label") as HTMLLabelElement;
  }
  return null;
}

export function click(element: Element, options?: MouseEventInit) {
  hover(element, options);
  const { disabled } = element as HTMLButtonElement;

  let ref = trackEvents(element, "pointerdown", "mousedown");

  fireEvent.pointerDown(element, options);
  if (!disabled) {
    fireEvent.mouseDown(element, options);
  }

  if (!ref.event.defaultPrevented) {
    if (isFocusable(element)) {
      focus(element);
      if (shouldBlurRightAfterFocus(element)) {
        blur(element);
      }
    } else if (!disabled) {
      const closestFocusable = getClosestFocusable(element);
      if (closestFocusable) {
        focus(closestFocusable);
      } else {
        blur();
      }
    }
  }

  ref = trackEvents(element, "click");

  fireEvent.pointerUp(element, options);

  if (disabled) return;

  fireEvent.mouseUp(element, options);

  const label = getClosestLabel(element);
  const input = (label?.htmlFor
    ? label.ownerDocument?.getElementById(label.htmlFor)
    : label?.querySelector("input,textarea,select")) as HTMLInputElement | null;
  const previousDisabled = Boolean(input?.disabled);

  if (label && input) {
    input.disabled = true;
  }

  fireEvent.click(element, options);

  if (label && input) {
    input.disabled = previousDisabled;
    if (!ref.event.defaultPrevented && isFocusable(input)) {
      focus(input);
      fireEvent.click(input);
    }
  }
}
