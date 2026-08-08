import { isVisible, invariant } from "@ariakit/utils";
import { getLastHovered, setLastHovered } from "./__hover-state.ts";
import { getInteractionDriver } from "./__interaction-driver.ts";
import { settle, wrapAsync } from "./__utils.ts";
import { dispatch } from "./dispatch.ts";
import { sleep } from "./sleep.ts";

function isPointerEventsEnabled(element: Element) {
  return getComputedStyle(element).pointerEvents !== "none";
}

/**
 * Moves the pointer over an element, simulating a real user hovering it. Fires
 * the relevant `pointer`/`mouse` enter, over, and move events, and dispatches the
 * matching leave events on the previously hovered element.
 *
 * Hidden elements and elements with `pointer-events: none` are handled the way a
 * browser would. Pass `options` to set event properties such as modifier keys.
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

    const driver = getInteractionDriver();
    if (await driver?.hover(element, options)) {
      setLastHovered(element);
      await sleep();
      return;
    }

    await simulateHover(element, options);
  });
}

export async function simulateHover(
  element: Element,
  options?: PointerEventInit,
) {
  const { ownerDocument } = element;
  const lastHovered = getLastHovered(ownerDocument);
  const { disabled } = element as HTMLButtonElement;
  const pointerEventsEnabled = isPointerEventsEnabled(element);

  if (lastHovered && lastHovered !== element && isVisible(lastHovered)) {
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

  // Settle between leaving the previously hovered element and entering the new
  // one — a cheap settle covers the transition's microtask/rAF work.
  await settle();

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

  setLastHovered(element);

  await sleep();
}
