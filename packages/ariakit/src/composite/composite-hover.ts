import { MouseEvent, useCallback } from "react";
import { contains } from "ariakit-utils/dom";
import { hasFocusWithin } from "ariakit-utils/focus";
import {
  useBooleanEventCallback,
  useEventCallback,
  useId,
} from "ariakit-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, BooleanOrCallback, Options, Props } from "ariakit-utils/types";
import { CompositeContext } from "./__utils";
import { CompositeState } from "./composite-state";

function getMouseDestination(event: MouseEvent<HTMLElement>) {
  const relatedTarget = event.relatedTarget as Node | null;
  if (relatedTarget?.nodeType === Node.ELEMENT_NODE) {
    return relatedTarget;
  }
  return null;
}

function hoveringInside(event: MouseEvent<HTMLElement>) {
  const nextElement = getMouseDestination(event);
  if (!nextElement) return false;
  return contains(event.currentTarget, nextElement);
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an element in a composite widget that receives
 * focus on mouse move and loses focus to the composite base element on mouse
 * leave. This should be combined with the `CompositeItem` component, the
 * `useCompositeItem` hook or any component/hook that uses them underneath.
 * @see https://ariakit.org/docs/composite
 * @example
 * ```jsx
 * const state = useCompositeState();
 * const props = useCompositeHover({ state });
 * <CompositeItem state={state} {...props}>Item</CompositeItem>
 * ```
 */
export const useCompositeHover = createHook<CompositeHoverOptions>(
  ({ state, focusOnMouseMove = true, ...props }) => {
    state = useStore(state || CompositeContext, ["move"]);
    const id = useId(props.id);

    const focusOnMouseMoveProp = useBooleanEventCallback(focusOnMouseMove);
    const onMouseMoveProp = useEventCallback(props.onMouseMove);

    const onMouseMove = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onMouseMoveProp(event);
        if (event.defaultPrevented) return;
        if (hasFocusWithin(event.currentTarget)) return;
        if (!focusOnMouseMoveProp(event)) return;
        state?.move(id);
      },
      [onMouseMoveProp, focusOnMouseMoveProp, state?.move, id]
    );

    const onMouseLeaveProp = useEventCallback(props.onMouseLeave);

    const onMouseLeave = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onMouseLeaveProp(event);
        if (event.defaultPrevented) return;
        if (hoveringInside(event)) return;
        if (!focusOnMouseMoveProp(event)) return;
        // Move focus to the composite container.
        state?.move(null);
      },
      [onMouseLeaveProp, state?.move]
    );

    props = {
      id,
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
 * @see https://ariakit.org/docs/composite
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
   * Whether to focus the composite item on mouse move.
   * @default true
   */
  focusOnMouseMove?: BooleanOrCallback<MouseEvent<HTMLElement>>;
};

export type CompositeHoverProps<T extends As = "div"> = Props<
  CompositeHoverOptions<T>
>;
