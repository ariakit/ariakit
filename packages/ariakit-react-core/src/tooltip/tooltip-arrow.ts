import { invariant } from "@ariakit/core/utils/misc";
import type { PopoverArrowOptions } from "../popover/popover-arrow.js";
import { usePopoverArrow } from "../popover/popover-arrow.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useTooltipContext } from "./tooltip-context.js";
import type { TooltipStore } from "./tooltip-store.js";

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
export const useTooltipArrow = createHook2<TagName, TooltipArrowOptions>(
  ({ store, size = 16, ...props }) => {
    // We need to get the tooltip store here because Tooltip is not using the
    // Popover component, so PopoverArrow can't access the popover context.
    const context = useTooltipContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "TooltipArrow must be wrapped in a Tooltip component.",
    );

    props = usePopoverArrow({ store, size, ...props });
    return props;
  },
);

/**
 * Renders an arrow inside a [`Tooltip`](https://ariakit.org/reference/tooltip)
 * pointing to the anchor element.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx {4}
 * <TooltipProvider>
 *   <TooltipAnchor>Anchor</TooltipAnchor>
 *   <Tooltip>
 *     <TooltipArrow />
 *     Tooltip
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 */
export const TooltipArrow = forwardRef(function TooltipArrow(
  props: TooltipArrowProps,
) {
  const htmlProps = useTooltipArrow(props);
  return createElement(TagName, htmlProps);
});

export interface TooltipArrowOptions<T extends ElementType = TagName>
  extends PopoverArrowOptions<T> {
  /**
   * Object returned by the
   * [`useTooltipStore`](https://ariakit.org/reference/use-tooltip-store) hook.
   * If not provided, the closest
   * [`Tooltip`](https://ariakit.org/reference/tooltip) or
   * [`TooltipProvider`](https://ariakit.org/reference/tooltip-provider)
   * components' context will be used.
   */
  store?: TooltipStore;
}

export type TooltipArrowProps<T extends ElementType = TagName> = Props2<
  T,
  TooltipArrowOptions<T>
>;
