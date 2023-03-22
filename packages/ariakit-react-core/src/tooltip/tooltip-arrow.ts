import { useContext } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import {
  PopoverArrowOptions,
  usePopoverArrow,
} from "../popover/popover-arrow.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import { As, Props } from "../utils/types.js";
import { TooltipContext } from "./tooltip-context.js";
import { TooltipStore } from "./tooltip-store.js";

/**
 * Returns props to create a `TooltipArrow` component.
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
 * Renders an arrow inside a `Tooltip` component.
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

export interface TooltipArrowOptions<T extends As = "div">
  extends PopoverArrowOptions<T> {
  /**
   * Object returned by the `useTooltipStore` hook. If not provided, the parent
   * `Tooltip` component's context will be used.
   */
  store?: TooltipStore;
}

export type TooltipArrowProps<T extends As = "div"> = Props<
  TooltipArrowOptions<T>
>;
