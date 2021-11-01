import { FocusEvent, MouseEvent, useCallback } from "react";
import {
  createHook,
  createComponent,
  createElement,
} from "ariakit-utils/system";
import { useEventCallback } from "ariakit-utils/hooks";
import { As, Props } from "ariakit-utils/types";
import {
  PopoverAnchorOptions,
  usePopoverAnchor,
} from "../popover/popover-anchor";
import { TooltipState } from "./tooltip-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an element that will be labelled or described by
 * a `Tooltip` component. This component will also be used as the reference to
 * position the tooltip on the screen.
 * @see https://ariakit.org/docs/tooltip
 * @example
 * ```jsx
 * const state = useToolTipState();
 * const props = useTooltipAnchor({ state });
 * <Role {...props}>Anchor</Role>
 * <Tooltip state={state}>Tooltip</Tooltip>
 * ```
 */
export const useTooltipAnchor = createHook<TooltipAnchorOptions>(
  ({ state, described, ...props }) => {
    const onFocusProp = useEventCallback(props.onFocus);

    const onFocus = useCallback(
      (event: FocusEvent<HTMLDivElement>) => {
        onFocusProp(event);
        if (event.defaultPrevented) return;
        state.show();
      },
      [onFocusProp, state.show]
    );

    const onBlurProp = useEventCallback(props.onBlur);

    const onBlur = useCallback(
      (event: FocusEvent<HTMLDivElement>) => {
        onBlurProp(event);
        if (event.defaultPrevented) return;
        state.hide();
      },
      [onBlurProp, state.hide]
    );

    const onMouseEnterProp = useEventCallback(props.onMouseEnter);

    const onMouseEnter = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onMouseEnterProp(event);
        if (event.defaultPrevented) return;
        state.show();
      },
      [onMouseEnterProp, state.show]
    );

    const onMouseLeaveProp = useEventCallback(props.onMouseLeave);

    const onMouseLeave = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onMouseLeaveProp(event);
        if (event.defaultPrevented) return;
        state.hide();
      },
      [onMouseLeaveProp, state.hide]
    );

    props = {
      tabIndex: 0,
      "aria-labelledby": !described ? state.contentElement?.id : undefined,
      "aria-describedby": described ? state.contentElement?.id : undefined,
      ...props,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
    };

    props = usePopoverAnchor({ state, ...props });

    return props;
  }
);

/**
 * A component that renders an element that will be labelled or described by
 * a `Tooltip` component. This component will also be used as the reference to
 * position the tooltip on the screen.
 * @see https://ariakit.org/docs/tooltip
 * @example
 * ```jsx
 * const tooltip = useTooltipState();
 * <TooltipAnchor state={tooltip}>Anchor</TooltipAnchor>
 * <Tooltip state={tooltip}>Tooltip</Tooltip>
 * ```
 */
export const TooltipAnchor = createComponent<TooltipAnchorOptions>((props) => {
  const htmlProps = useTooltipAnchor(props);
  return createElement("div", htmlProps);
});

export type TooltipAnchorOptions<T extends As = "div"> = Omit<
  PopoverAnchorOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useTooltipState` hook.
   */
  state: TooltipState;
  /**
   * Determines wether the tooltip anchor is described or labelled by the
   * tooltip. If `true`, the tooltip id will be set as the `aria-describedby`
   * attribute on the anchor element, and not as the `aria-labelledby`
   * attribute.
   * @default false
   * @example
   * ```jsx
   * const tooltip = useTooltipState();
   * <TooltipAnchor state={tooltip} described>
   *   This is an element with a visible label.
   * </TooltipAnchor>
   * <Tooltip state={tooltip}>Description</Tooltip>
   * ```
   */
  described?: boolean;
};

export type TooltipAnchorProps<T extends As = "div"> = Props<
  TooltipAnchorOptions<T>
>;
