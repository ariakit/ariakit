import { useContext } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import { PopoverArrowOptions, usePopoverArrow } from "../popover/popover-arrow";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { TooltipContext } from "./tooltip-context";
import { TooltipStore } from "./tooltip-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow inside a tooltip element.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const store = useToolTipStore();
 * const props = useTooltipArrow({ store });
 * <TooltipAnchor store={store}>Anchor</TooltipAnchor>
 * <Tooltip store={store}>
 *   <Role {...props} />
 *   Tooltip
 * </Tooltip>
 * ```
 */
export const useTooltipArrow = createHook<TooltipArrowOptions>(
  ({ store, size = 16, ...props }) => {
    // We need to get the tooltip store here because Tooltip is not using the
    // Popover component, so PopoverArrow can't access the popover context.
    const context = useContext(TooltipContext);
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TooltipArrow must be wrapped in a Tooltip component"
    );

    props = usePopoverArrow({ store, size, ...props });
    return props;
  }
);

/**
 * A component that renders an arrow inside a `Tooltip` component.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const tooltip = useTooltipStore();
 * <TooltipAnchor store={tooltip}>Anchor</TooltipAnchor>
 * <Tooltip store={tooltip}>
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
  "store"
> & {
  /**
   * Object returned by the `useTooltipStore` hook. If not provided, the parent
   * `Tooltip` component's context will be used.
   */
  store?: TooltipStore;
};

export type TooltipArrowProps<T extends As = "div"> = Props<
  TooltipArrowOptions<T>
>;
