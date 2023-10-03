import { isVisible } from "@ariakit/core/utils/dom";
import { invariant } from "@ariakit/core/utils/misc";
import { wrapAsync } from "./__utils.js";
import { dispatch } from "./dispatch.js";
import { sleep } from "./sleep.js";

type DocumentWithLastHovered = Document & {
  lastHovered?: Element | null;
};

function isPointerEventsEnabled(element: Element) {
  return getComputedStyle(element).pointerEvents !== "none";
}

export function hover(element: Element | null, options?: MouseEventInit) {
  return wrapAsync(async () => {
    invariant(element, "Unable to hover on null element");

    if (!isVisible(element)) return;

    const document = element.ownerDocument as DocumentWithLastHovered;
    const { lastHovered } = document;
    const { disabled } = element as HTMLButtonElement;
    const pointerEventsEnabled = isPointerEventsEnabled(element);

    if (lastHovered && lastHovered !== element && isVisible(lastHovered)) {
      await dispatch.pointerMove(lastHovered, options);
      await dispatch.mouseMove(lastHovered, options);

      if (isPointerEventsEnabled(lastHovered)) {
        const isElementWithinLastHovered = lastHovered.contains(element);
        const relatedTarget = pointerEventsEnabled ? element : null;
        const leaveOptions = { ...options, relatedTarget };

        await dispatch.pointerOut(lastHovered, leaveOptions);

        if (!isElementWithinLastHovered) {
          await dispatch.pointerLeave(lastHovered, leaveOptions);
        }

        await dispatch.mouseOut(lastHovered, leaveOptions);

        if (!isElementWithinLastHovered) {
          await dispatch.mouseLeave(lastHovered, leaveOptions);
        }
      }
    }

    await sleep();

    if (pointerEventsEnabled) {
      const enterOptions = lastHovered
        ? { relatedTarget: lastHovered, ...options }
        : options;

      await dispatch.pointerOver(element, enterOptions);
      await dispatch.pointerEnter(element, enterOptions);
      if (!disabled) {
        await dispatch.mouseOver(element, enterOptions);
        await dispatch.mouseEnter(element, enterOptions);
      }
    }

    await dispatch.pointerMove(element, options);
    if (!disabled) {
      await dispatch.mouseMove(element, options);
    }

    document.lastHovered = element;

    await sleep();
  });
}
