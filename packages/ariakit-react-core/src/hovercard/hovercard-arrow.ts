import type { PopoverArrowOptions } from "../popover/popover-arrow.js";
import { usePopoverArrow } from "../popover/popover-arrow.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
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
export const useHovercardArrow = createHook<HovercardArrowOptions>((props) => {
  props = usePopoverArrow(props);
  return props;
});

/**
 * Renders an arrow element in a hovercard.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const hovercard = useHovercardStore();
 * <HovercardAnchor store={hovercard}>@username</HovercardAnchor>
 * <Hovercard store={hovercard}>
 *   <HovercardArrow />
 *   Details
 * </Hovercard>
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
   * Object returned by the `useHovercardStore` hook. If not provided, the
   * parent `Hovercard` component's context will be used.
   */
  store?: HovercardStore;
}

export type HovercardArrowProps<T extends As = "div"> = Props<
  HovercardArrowOptions<T>
>;
