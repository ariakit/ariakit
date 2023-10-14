"use client";
import type { PopoverDescriptionOptions } from "../popover/popover-description.js";
import { usePopoverDescription } from "../popover/popover-description.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { HovercardStore } from "./hovercard-store.js";

/**
 * Returns props to create a `HovercardDescription` component. This hook must be
 * used in a component that's wrapped with `Hovercard` so the `aria-describedby`
 * prop is properly set on the hovercard element.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * // This component must be wrapped with Hovercard
 * const props = useHovercardDescription();
 * <Role {...props}>Description</Role>
 * ```
 */
export const useHovercardDescription = createHook<HovercardDescriptionOptions>(
  (props) => {
    props = usePopoverDescription(props);
    return props;
  },
);

/**
 * Renders a description in a hovercard. This component must be wrapped within
 * [`Hovercard`](https://ariakit.org/reference/hovercard) so the
 * `aria-describedby` prop is properly set on the hovercard element.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * <HovercardProvider>
 *   <Hovercard>
 *     <HovercardDescription>Description</HovercardDescription>
 *   </Hovercard>
 * </HovercardProvider>
 * ```
 */
export const HovercardDescription =
  createComponent<HovercardDescriptionOptions>((props) => {
    const htmlProps = useHovercardDescription(props);
    return createElement("p", htmlProps);
  });

if (process.env.NODE_ENV !== "production") {
  HovercardDescription.displayName = "HovercardDescription";
}

export interface HovercardDescriptionOptions<T extends As = "p">
  extends PopoverDescriptionOptions<T> {
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

export type HovercardDescriptionProps<T extends As = "p"> = Props<
  HovercardDescriptionOptions<T>
>;
