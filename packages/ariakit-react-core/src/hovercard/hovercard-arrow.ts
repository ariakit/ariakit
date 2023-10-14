"use client";
import type { PopoverArrowOptions } from "../popover/popover-arrow.js";
import { usePopoverArrow } from "../popover/popover-arrow.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useHovercardContext } from "./hovercard-context.js";
import type { HovercardStore } from "./hovercard-store.js";

/**
 * Returns props to create a `HovercardArrow` component.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const store = useHovercardStore();
 * const props = useHovercardArrow({ store });
 * <Hovercard store={store}>
 *   <Role {...props} />
 *   Details
 * </Hovercard>
 * ```
 */
export const useHovercardArrow = createHook<HovercardArrowOptions>(
  ({ store, ...props }) => {
    const context = useHovercardContext();
    store = store || context;
    props = usePopoverArrow({ store, ...props });
    return props;
  },
);

/**
 * Renders an arrow element in a hovercard.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * <HovercardProvider>
 *   <HovercardAnchor>@username</HovercardAnchor>
 *   <Hovercard>
 *     <HovercardArrow />
 *     Details
 *   </Hovercard>
 * </HovercardProvider>
 * ```
 */
export const HovercardArrow = createComponent<HovercardArrowOptions>(
  (props) => {
    const htmlProps = useHovercardArrow(props);
    return createElement("div", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  HovercardArrow.displayName = "HovercardArrow";
}

export interface HovercardArrowOptions<T extends As = "div">
  extends PopoverArrowOptions<T> {
  /**
   * Object returned by the
   * [`useHovercardStore`](https://ariakit.org/reference/use-hovercard-store)
   * hook. If not provided, the closest
   * [`Hovercard`](https://ariakit.org/reference/hovercard) or
   * [`HovercardProvider`](https://ariakit.org/reference/hovercard-provider)
   * components' context will be used.
   */
  store?: HovercardStore;
}

export type HovercardArrowProps<T extends As = "div"> = Props<
  HovercardArrowOptions<T>
>;
