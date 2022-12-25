import {
  PopoverHeadingOptions,
  usePopoverHeading,
} from "../popover/popover-heading";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { HovercardStore } from "./hovercard-store";

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
  }
);

/**
 * Renders a heading in a hovercard. This component must be wrapped with
 * `Hovercard` so the `aria-labelledby` prop is properly set on the hovercard
 * element.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const hovercard = useHovercardStore();
 * <Hovercard store={hovercard}>
 *   <HovercardHeading>Heading</HovercardHeading>
 * </Hovercard>
 * ```
 */
export const HovercardHeading = createComponent<HovercardHeadingOptions>(
  (props) => {
    const htmlProps = useHovercardHeading(props);
    return createElement("h1", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  HovercardHeading.displayName = "HovercardHeading";
}

export interface HovercardHeadingOptions<T extends As = "h1">
  extends PopoverHeadingOptions<T> {
  /**
   * Object returned by the `useHovercardStore` hook. If not provided, the
   * parent `Hovercard` component's context will be used.
   */
  store?: HovercardStore;
}

export type HovercardHeadingProps<T extends As = "h1"> = Props<
  HovercardHeadingOptions<T>
>;
