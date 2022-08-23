import { useContext } from "react";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { PopoverArrowOptions, usePopoverArrow } from "../popover/popover-arrow";
import { TooltipContext } from "./__utils";
import { TooltipState } from "./tooltip-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow inside a tooltip element.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const state = useToolTipState();
 * const props = useTooltipArrow({ state });
 * <TooltipAnchor state={state}>Anchor</TooltipAnchor>
 * <Tooltip state={state}>
 *   <Role {...props} />
 *   Tooltip
 * </Tooltip>
 * ```
 */
export const useTooltipArrow = createHook<TooltipArrowOptions>(
  ({ state, size = 16, ...props }) => {
    // We need to get the tooltip state here because Tooltip is not using the
    // Popover component, so PopoverArrow can't access the popover context.
    const context = useContext(TooltipContext);
    state = state || context;
    props = usePopoverArrow({ state, size, ...props });
    return props;
  }
);

/**
 * A component that renders an arrow inside a `Tooltip` component.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const tooltip = useTooltipState();
 * <TooltipAnchor state={tooltip}>Anchor</TooltipAnchor>
 * <Tooltip state={tooltip}>
 *   <TooltipArrow />
 *   Tooltip
 * </Tooltip>
 * ```
 */
export const TooltipArrow = createComponent<TooltipArrowOptions>((props) => {
  const htmlProps = useTooltipArrow(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  TooltipArrow.displayName = "TooltipArrow";
}

export type TooltipArrowOptions<T extends As = "div"> = Omit<
  PopoverArrowOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useTooltipState` hook. If not provided, the parent
   * `Tooltip` component's context will be used.
   */
  state?: TooltipState;
};

export type TooltipArrowProps<T extends As = "div"> = Props<
  TooltipArrowOptions<T>
>;
