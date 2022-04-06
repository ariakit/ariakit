import {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { addGlobalEventListener } from "ariakit-utils/events";
import {
  useBooleanEventCallback,
  useEventCallback,
  useForkRef,
} from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, BooleanOrCallback, Props } from "ariakit-utils/types";
import { FocusableOptions, useFocusable } from "../focusable";
import { HovercardState } from "./hovercard-state";

function hasMouseMovement(event: ReactMouseEvent | MouseEvent) {
  console.log(event.movementX, event.movementY);
  return event.movementX || event.movementY || process.env.NODE_ENV === "test";
}

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

    const onMouseMoveProp = useEventCallback(props.onMouseMove);
    const showOnHoverProp = useBooleanEventCallback(showOnHover);

    const onMouseMove = useCallback(
      (event: ReactMouseEvent<HTMLAnchorElement>) => {
        state.anchorRef.current = event.currentTarget;
        onMouseMoveProp(event);
        if (disabled) return;
        if (event.defaultPrevented) return;
        if (showTimeoutRef.current) return;
        if (!hasMouseMovement(event)) return;
        if (!showOnHoverProp(event)) return;
        showTimeoutRef.current = window.setTimeout(() => {
          showTimeoutRef.current = 0;
          state.show();
        }, state.showTimeout);
      },
      [
        state.anchorRef,
        onMouseMoveProp,
        disabled,
        showOnHoverProp,
        state.show,
        state.showTimeout,
      ]
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
