import { MouseEvent as ReactMouseEvent, useEffect, useRef } from "react";
import {
  useBooleanEvent,
  useEvent,
  useForkRef,
  useIsMouseMoving,
} from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import { addGlobalEventListener } from "ariakit-utils/events";
import { BooleanOrCallback } from "ariakit-utils/types";
import { FocusableOptions, useFocusable } from "../focusable";
import { HovercardState } from "./hovercard-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an anchor element that will open a popover
 * (`Hovercard`) on hover.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const state = useHovercardState();
 * const props = useHovercardAnchor({ state });
 * <Role as="a" {...props}>@username</Role>
 * <Hovercard state={state}>Details</Hovercard>
 * ```
 */
export const useHovercardAnchor = createHook<HovercardAnchorOptions>(
  ({ state, showOnHover = true, ...props }) => {
    const disabled =
      props.disabled ||
      props["aria-disabled"] === true ||
      props["aria-disabled"] === "true";

    const showTimeoutRef = useRef(0);

    // Clear the show timeout if the anchor is unmounted
    useEffect(() => () => window.clearTimeout(showTimeoutRef.current), []);

    // Clear the show timeout if the mouse leaves the anchor element. We're
    // using the native mouseleave event instead of React's onMouseLeave so we
    // bypass the event.stopPropagation() logic set on the Hovercard component
    // for when the mouse is moving toward the Hovercard.
    useEffect(() => {
      const onMouseLeave = (event: MouseEvent) => {
        const element = state.anchorRef.current;
        if (!element) return;
        if (event.target !== element) return;
        window.clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = 0;
      };
      return addGlobalEventListener("mouseleave", onMouseLeave, true);
    }, [state.anchorRef]);

    const onMouseMoveProp = props.onMouseMove;
    const showOnHoverProp = useBooleanEvent(showOnHover);
    const isMouseMoving = useIsMouseMoving();

    const onMouseMove = useEvent(
      (event: ReactMouseEvent<HTMLAnchorElement>) => {
        state.anchorRef.current = event.currentTarget;
        onMouseMoveProp?.(event);
        if (disabled) return;
        if (event.defaultPrevented) return;
        if (showTimeoutRef.current) return;
        if (!isMouseMoving()) return;
        if (!showOnHoverProp(event)) return;
        showTimeoutRef.current = window.setTimeout(() => {
          showTimeoutRef.current = 0;
          state.show();
        }, state.showTimeout);
      }
    );

    props = {
      ...props,
      ref: useForkRef(state.anchorRef, props.ref),
      onMouseMove,
    };

    props = useFocusable(props);

    return props;
  }
);

/**
 * A component that renders an anchor element that will open a popover
 * (`Hovercard`) on hover.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const hovercard = useHovercardState();
 * <HovercardAnchor state={hovercard}>@username</HovercardAnchor>
 * <Hovercard state={hovercard}>Details</Hovercard>
 * ```
 */
export const HovercardAnchor = createComponent<HovercardAnchorOptions>(
  (props) => {
    const htmlProps = useHovercardAnchor(props);
    return createElement("a", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  HovercardAnchor.displayName = "HovercardAnchor";
}

export type HovercardAnchorOptions<T extends As = "a"> = FocusableOptions<T> & {
  /**
   * Object returned by the `useHovercardState` hook.
   */
  state: HovercardState;
  /**
   * Whether to show the hovercard on mouse move.
   * @default true
   */
  showOnHover?: BooleanOrCallback<ReactMouseEvent<HTMLElement>>;
};

export type HovercardAnchorProps<T extends As = "a"> = Props<
  HovercardAnchorOptions<T>
>;
