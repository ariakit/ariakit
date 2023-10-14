"use client";
import type { DialogHeadingOptions } from "../dialog/dialog-heading.js";
import { useDialogHeading } from "../dialog/dialog-heading.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { PopoverStore } from "./popover-store.js";

/**
 * Returns props to create a `PopoverHeading` component. This hook must be used
 * in a component that's wrapped with `Popover` so the `aria-labelledby` prop is
 * properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * // This component must be wrapped with Popover
 * const props = usePopoverHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export const usePopoverHeading = createHook<PopoverHeadingOptions>((props) => {
  props = useDialogHeading(props);
  return props;
});

/**
 * Renders a heading in a popover. This component must be wrapped with
 * [`Popover`](https://ariakit.org/reference/popover) so the `aria-labelledby`
 * prop is properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * <PopoverProvider>
 *   <Popover>
 *     <PopoverHeading>Heading</PopoverHeading>
 *   </Popover>
 * </PopoverProvider>
 * ```
 */
export const PopoverHeading = createComponent<PopoverHeadingOptions>(
  (props) => {
    const htmlProps = usePopoverHeading(props);
    return createElement("h1", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  PopoverHeading.displayName = "PopoverHeading";
}

export interface PopoverHeadingOptions<T extends As = "h1">
  extends DialogHeadingOptions<T> {
  /**
   * Object returned by the
   * [`usePopoverStore`](https://ariakit.org/reference/use-popover-store) hook.
   * If not provided, the closest
   * [`Popover`](https://ariakit.org/reference/popover) or
   * [`PopoverProvider`](https://ariakit.org/reference/popover-provider)
   * components' context will be used.
   */
  store?: PopoverStore;
}

export type PopoverHeadingProps<T extends As = "h1"> = Props<
  PopoverHeadingOptions<T>
>;
