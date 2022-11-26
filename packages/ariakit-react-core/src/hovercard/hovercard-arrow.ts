import { PopoverArrowOptions, usePopoverArrow } from "../popover/popover-arrow";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { HovercardStore } from "./hovercard-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an arrow element in a hovercard.
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
 * A component that renders an arrow element in a hovercard.
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
  }
);

if (process.env.NODE_ENV !== "production") {
  HovercardArrow.displayName = "HovercardArrow";
}

export type HovercardArrowOptions<T extends As = "div"> = Omit<
  PopoverArrowOptions<T>,
  "store"
> & {
  /**
   * Object returned by the `useHovercardStore` hook. If not provided, the
   * parent `Hovercard` component's context will be used.
   */
  store?: HovercardStore;
};

export type HovercardArrowProps<T extends As = "div"> = Props<
  HovercardArrowOptions<T>
>;
