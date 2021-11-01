import {
  MouseEvent as ReactMouseEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  createHook,
  createComponent,
  createElement,
} from "ariakit-utils/system";
import { useEventCallback, useForkRef } from "ariakit-utils/hooks";
import { addGlobalEventListener } from "ariakit-utils/events";
import { As, Props } from "ariakit-utils/types";
import { FocusableOptions, useFocusable } from "../focusable";
import { HovercardState } from "./hovercard-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an anchor element that will open a popover
 * (`Hovercard`) on hover.
 * @see https://ariakit.org/docs/hovercard
 * @example
 * ```jsx
 * const state = useHovercardState();
 * const props = useHovercardAnchor({ state });
 * <Role as="a" {...props}>@username</Role>
 * <Hovercard state={state}>Details</Hovercard>
 * ```
 */
export const useHovercardAnchor = createHook<HovercardAnchorOptions>(
  ({ state, showOnMouseMove = true, ...props }) => {
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

    const onMouseMove = useCallback(
      (event: ReactMouseEvent<HTMLAnchorElement>) => {
        state.anchorRef.current = event.currentTarget;
        onMouseMoveProp(event);
        if (event.defaultPrevented) return;
        if (!showOnMouseMove) return;
        if (!showTimeoutRef.current) {
          showTimeoutRef.current = window.setTimeout(() => {
            showTimeoutRef.current = 0;
            state.show();
          }, state.showTimeout);
        }
      },
      [
        state.anchorRef,
        onMouseMoveProp,
        showOnMouseMove,
        state.show,
        state.showTimeout,
      ]
    );

    const onFocusVisibleProp = useEventCallback(props.onFocusVisible);

    // When the anchor receives keyboard focus, the hovercard disclosure
    // element should be visible so keyboard users can use it to access the
    // hovercard contents.
    const onFocusVisible = useCallback(
      (event: SyntheticEvent<HTMLAnchorElement>) => {
        onFocusVisibleProp(event);
        if (event.defaultPrevented) return;
        state.setDisclosureVisible(true);
      },
      [onFocusVisibleProp, state.setDisclosureVisible]
    );

    props = {
      ...props,
      ref: useForkRef(state.anchorRef, props.ref),
      onMouseMove,
    };

    props = useFocusable({ ...props, onFocusVisible });

    return props;
  }
);

/**
 * A component that renders an anchor element that will open a popover
 * (`Hovercard`) on hover.
 * @see https://ariakit.org/docs/hovercard
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
  showOnMouseMove?: boolean;
};

export type HovercardAnchorProps<T extends As = "a"> = Props<
  HovercardAnchorOptions<T>
>;
