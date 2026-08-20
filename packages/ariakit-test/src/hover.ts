import { invariant } from "@ariakit/utils";
import { getPointerOptions } from "./__mouse.ts";
import { settle, wrapAsync } from "./__utils.ts";
import { dispatch } from "./dispatch.ts";
import {
  getElementStyle,
  isFramePointerEventsEnabled,
  isVisible,
} from "./shims.ts";
import { sleep } from "./sleep.ts";

type DocumentWithLastHovered = Document & {
  lastHovered?: Element | null;
};

function isPointerEventsEnabled(element: Element) {
  return getElementStyle(element)?.pointerEvents !== "none";
}

/**
 * Moves the pointer over an element, simulating a real user hovering it. Fires
 * the relevant `pointer`/`mouse` enter, over, and move events, and dispatches the
 * matching leave events on the previously hovered element.
 *
 * Hidden elements and elements with `pointer-events: none` are handled the way a
 * browser would. Pass `options` to set event properties such as modifier keys.
 * The pointer events report `pressure: 0`, or `0.5` when you pass `buttons` to
 * describe a move with a button held down, as during a drag.
 * @example
 * ```ts
 * await hover(q.button("More options"));
 * expect(q.menu()).toBeVisible();
 * ```
 */
export function hover(element: Element | null, options?: PointerEventInit) {
  return wrapAsync(async () => {
    invariant(element, "Unable to hover on null element");

    if (!isVisible(element)) return;
    if (!isFramePointerEventsEnabled(element)) return;

    const document = element.ownerDocument as DocumentWithLastHovered;
    const { lastHovered } = document;
    const { disabled } = element as HTMLButtonElement;
    const pointerEventsEnabled = isPointerEventsEnabled(element);
    // A move changes no button, so the caller's `buttons` already describes the
    // pointer, and every event below reports the same one.
    const moveOptions = getPointerOptions(options);

    if (lastHovered && lastHovered !== element && isVisible(lastHovered)) {
      await dispatch.pointerMove(lastHovered, moveOptions);
      await dispatch.mouseMove(lastHovered, moveOptions);

      if (isPointerEventsEnabled(lastHovered)) {
        const isElementWithinLastHovered = lastHovered.contains(element);
        const relatedTarget = pointerEventsEnabled ? element : null;
        const leaveOptions = { ...moveOptions, relatedTarget };

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

    // Settle between leaving the previously hovered element and entering the new
    // one — a cheap settle covers the transition's microtask/rAF work.
    await settle();

    if (pointerEventsEnabled) {
      const enterOptions = lastHovered
        ? { relatedTarget: lastHovered, ...moveOptions }
        : moveOptions;

      await dispatch.pointerOver(element, enterOptions);
      await dispatch.pointerEnter(element, enterOptions);
      if (!disabled) {
        await dispatch.mouseOver(element, enterOptions);
        await dispatch.mouseEnter(element, enterOptions);
      }
    }

    await dispatch.pointerMove(element, moveOptions);
    if (!disabled) {
      await dispatch.mouseMove(element, moveOptions);
    }

    document.lastHovered = element;

    await sleep();
  });
}
