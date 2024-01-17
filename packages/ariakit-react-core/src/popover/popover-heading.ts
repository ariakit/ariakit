import type { ElementType } from "react";
import type { DialogHeadingOptions } from "../dialog/dialog-heading.js";
import { useDialogHeading } from "../dialog/dialog-heading.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import type { PopoverStore } from "./popover-store.js";

const TagName = "h1" satisfies ElementType;
type TagName = typeof TagName;

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
export const usePopoverHeading = createHook<TagName, PopoverHeadingOptions>(
  function usePopoverHeading(props) {
    props = useDialogHeading(props);
    return props;
  },
);

/**
 * Renders a heading in a popover. This component must be wrapped with
 * [`Popover`](https://ariakit.org/reference/popover) so the `aria-labelledby`
 * prop is properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx {3}
 * <PopoverProvider>
 *   <Popover>
 *     <PopoverHeading>Heading</PopoverHeading>
 *   </Popover>
 * </PopoverProvider>
 * ```
 */
export const PopoverHeading = forwardRef(function PopoverHeading(
  props: PopoverHeadingProps,
) {
  const htmlProps = usePopoverHeading(props);
  return createElement(TagName, htmlProps);
});

export interface PopoverHeadingOptions<T extends ElementType = TagName>
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

export type PopoverHeadingProps<T extends ElementType = TagName> = Props<
  T,
  PopoverHeadingOptions<T>
>;
