import { MouseEvent as ReactMouseEvent, useCallback, useEffect } from "react";
import { closest, contains } from "ariakit-utils/dom";
import { addGlobalEventListener } from "ariakit-utils/events";
import { hasFocusWithin } from "ariakit-utils/focus";
import { useBooleanEventCallback, useEventCallback } from "ariakit-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, BooleanOrCallback, Options, Props } from "ariakit-utils/types";
import { CompositeContext } from "./__utils";
import { CompositeState } from "./composite-state";

let screenX = 0;
let screenY = 0;
let assignMousePosition = () => {};

function trackMousePosition(event: MouseEvent) {
  // Discard mousemove events that are not moving the mouse.
  if (!event.movementX || !event.movementY) return;
  // Assign the previous mouse position so we can check if the mouse is moving
  // on mouseleave.
  assignMousePosition();
  // Prepare the next mouse position.
  assignMousePosition = () => {
    screenX = event.screenX;
    screenY = event.screenY;
  };
}

function isMouseMoving(event: ReactMouseEvent | MouseEvent) {
  // JSDOM doesn't support screenX/screenY
  if (process.env.NODE_ENV === "test") return true;
  return event.screenX - screenX || event.screenY - screenY;
}

function getMouseDestination(event: ReactMouseEvent<HTMLElement>) {
  const relatedTarget = event.relatedTarget as Node | null;
  if (relatedTarget?.nodeType === Node.ELEMENT_NODE) {
    return relatedTarget as Element;
  }
  return null;
}

function hoveringInside(event: ReactMouseEvent<HTMLElement>) {
  const nextElement = getMouseDestination(event);
  if (!nextElement) return false;
  return contains(event.currentTarget, nextElement);
}

function movingToAnotherItem(event: ReactMouseEvent<HTMLElement>) {
  const dest = getMouseDestination(event);
  if (!dest) return false;
  const item = closest(dest, "[data-composite-hover]");
  return !!item;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an element in a composite widget that receives
 * focus on mouse move and loses focus to the composite base element on mouse
 * leave. This should be combined with the `CompositeItem` component, the
 * `useCompositeItem` hook or any component/hook that uses them underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const state = useCompositeState();
 * const props = useCompositeHover({ state });
 * <CompositeItem state={state} {...props}>Item</CompositeItem>
 * ```
 */
export const useCompositeHover = createHook<CompositeHoverOptions>(
  ({ state, focusOnHover = true, ...props }) => {
    state = useStore(state || CompositeContext, ["setActiveId", "baseRef"]);

    const focusOnHoverProp = useBooleanEventCallback(focusOnHover);
    const onMouseMoveProp = useEventCallback(props.onMouseMove);

    useEffect(() => {
      // We're not returning the event listener cleanup function here because we
      // may lose some events if this component is unmounted, but others are
      // still mounted.
      addGlobalEventListener("mousemove", trackMousePosition);
    }, []);

    const onMouseMove = useCallback(
      (event: ReactMouseEvent<HTMLDivElement>) => {
        onMouseMoveProp(event);
        if (event.defaultPrevented) return;
        if (!focusOnHoverProp(event)) return;
        // If we're hovering hover an item that doesn't have DOM focus, we move
        // focus to the composite element. We're doing this here before setting
        // the active id because the composite element will automatically set
        // the active id to null when it receives focus.
        if (!hasFocusWithin(event.currentTarget)) {
          state?.baseRef.current?.focus();
        }
        state?.setActiveId(event.currentTarget.id);
      },
      [onMouseMoveProp, focusOnHoverProp, state?.baseRef, state?.setActiveId]
    );

    const onMouseLeaveProp = useEventCallback(props.onMouseLeave);

    const onMouseLeave = useCallback(
      (event: ReactMouseEvent<HTMLDivElement>) => {
        onMouseLeaveProp(event);
        if (event.defaultPrevented) return;
        if (!isMouseMoving(event)) return;
        if (hoveringInside(event)) return;
        if (movingToAnotherItem(event)) return;
        if (!focusOnHoverProp(event)) return;
        state?.setActiveId(null);
        // Move focus to the composite element.
        state?.baseRef.current?.focus();
      },
      [onMouseLeaveProp, focusOnHoverProp, state?.setActiveId, state?.baseRef]
    );

    props = {
      "data-composite-hover": "",
      ...props,
      onMouseMove,
      onMouseLeave,
    };

    return props;
  }
);

/**
 * A component that renders an element in a composite widget that receives focus
 * on mouse move and loses focus to the composite base element on mouse leave.
 * This should be combined with the `CompositeItem` component, the
 * `useCompositeItem` hook or any component/hook that uses them underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeState();
 * <Composite state={composite}>
 *   <CompositeHover as={CompositeItem}>Item</CompositeHover>
 * </Composite>
 * ```
 */
export const CompositeHover = createMemoComponent<CompositeHoverOptions>(
  (props) => {
    const htmlProps = useCompositeHover(props);
    return createElement("div", htmlProps);
  }
);

export type CompositeHoverOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useCompositeState` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  state?: CompositeState;
  /**
   * Whether to focus the composite item on hover.
   * @default true
   */
  focusOnHover?: BooleanOrCallback<ReactMouseEvent<HTMLElement>>;
};

export type CompositeHoverProps<T extends As = "div"> = Props<
  CompositeHoverOptions<T>
>;
