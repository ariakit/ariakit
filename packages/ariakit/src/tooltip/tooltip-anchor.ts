import { FocusEvent, MouseEvent } from "react";
import { useEvent } from "ariakit-react-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
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
 * @see https://ariakit.org/components/tooltip
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
    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      // When using multiple anchors for the same tooltip, we need to re-render
      // the tooltip to update its position.
      if (state.anchorRef.current !== event.currentTarget) {
        state.anchorRef.current = event.currentTarget;
        state.render();
      }
      state.show();
    });

    const onBlurProp = props.onBlur;

    const onBlur = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onBlurProp?.(event);
      if (event.defaultPrevented) return;
      state.hide();
    });

    const onMouseEnterProp = props.onMouseEnter;

    const onMouseEnter = useEvent((event: MouseEvent<HTMLDivElement>) => {
      onMouseEnterProp?.(event);
      if (event.defaultPrevented) return;
      // When using multiple anchors for the same tooltip, we need to re-render
      // the tooltip to update its position.
      if (state.anchorRef.current !== event.currentTarget) {
        state.anchorRef.current = event.currentTarget;
        state.render();
      }
      state.show();
    });

    const onMouseLeaveProp = props.onMouseLeave;

    const onMouseLeave = useEvent((event: MouseEvent<HTMLDivElement>) => {
      onMouseLeaveProp?.(event);
      if (event.defaultPrevented) return;
      state.hide();
    });

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
 * @see https://ariakit.org/components/tooltip
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

if (process.env.NODE_ENV !== "production") {
  TooltipAnchor.displayName = "TooltipAnchor";
}

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
