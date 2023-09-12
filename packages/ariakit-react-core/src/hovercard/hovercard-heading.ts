import type { PopoverHeadingOptions } from "../popover/popover-heading.js";
import { usePopoverHeading } from "../popover/popover-heading.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { HovercardStore } from "./hovercard-store.js";

/**
 * Returns props to create a `HovercardHeading` component. This hook must be
 * used in a component that's wrapped with `Hovercard` so the `aria-labelledby`
 * prop is properly set on the hovercard element.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * // This component must be wrapped with Hovercard
 * const props = useHovercardHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export const useHovercardHeading = createHook<HovercardHeadingOptions>(
  (props) => {
    props = usePopoverHeading(props);
    return props;
  },
);

/**
 * Renders a heading in a hovercard. This component must be wrapped within
 * [`Hovercard`](https://ariakit.org/reference/hovercard) so the
 * `aria-labelledby` prop is properly set on the hovercard element.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * <HovercardProvider>
 *   <Hovercard>
 *     <HovercardHeading>Heading</HovercardHeading>
 *   </Hovercard>
 * </HovercardProvider>
 * ```
 */
export const HovercardHeading = createComponent<HovercardHeadingOptions>(
  (props) => {
    const htmlProps = useHovercardHeading(props);
    return createElement("h1", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  HovercardHeading.displayName = "HovercardHeading";
}

export interface HovercardHeadingOptions<T extends As = "h1">
  extends PopoverHeadingOptions<T> {
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

export type HovercardHeadingProps<T extends As = "h1"> = Props<
  HovercardHeadingOptions<T>
>;
