import "./polyfills.js";
import { isVisible } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import { queuedMicrotasks } from "./__utils.js";
import { fireEvent } from "./fire-event.js";
import { sleep } from "./sleep.js";

type DocumentWithLastHovered = Document & {
  lastHovered?: Element | null;
};

function isPointerEventsEnabled(element: Element) {
  return getComputedStyle(element).pointerEvents !== "none";
}

export async function hover(element: Element | null, options?: MouseEventInit) {
  invariant(element, "Unable to hover on null element");

  if (!isVisible(element)) return;

  const document = element.ownerDocument as DocumentWithLastHovered;
  const { lastHovered } = document;
  const { disabled } = element as HTMLButtonElement;
  const pointerEventsEnabled = isPointerEventsEnabled(element);

  if (lastHovered && lastHovered !== element && isVisible(lastHovered)) {
    fireEvent.pointerMove(lastHovered, options);
    fireEvent.mouseMove(lastHovered, options);

    if (isPointerEventsEnabled(lastHovered)) {
      const isElementWithinLastHovered = lastHovered.contains(element);
      const relatedTarget = pointerEventsEnabled ? element : null;
      const leaveOptions = { ...options, relatedTarget };

      fireEvent.pointerOut(lastHovered, leaveOptions);

      if (!isElementWithinLastHovered) {
        fireEvent.pointerLeave(lastHovered, leaveOptions);
      }

      fireEvent.mouseOut(lastHovered, leaveOptions);

      if (!isElementWithinLastHovered) {
        fireEvent.mouseLeave(lastHovered, leaveOptions);
      }
    }
  }

  await sleep();

  if (pointerEventsEnabled) {
    const enterOptions = lastHovered
      ? { relatedTarget: lastHovered, ...options }
      : options;

    fireEvent.pointerOver(element, enterOptions);
    fireEvent.pointerEnter(element, enterOptions);
    if (!disabled) {
      fireEvent.mouseOver(element, enterOptions);
      fireEvent.mouseEnter(element, enterOptions);
    }
  }

  fireEvent.pointerMove(element, options);
  if (!disabled) {
    fireEvent.mouseMove(element, options);
  }

  document.lastHovered = element;

  await queuedMicrotasks();
}
