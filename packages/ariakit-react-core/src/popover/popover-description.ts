import type { DialogDescriptionOptions } from "../dialog/dialog-description.js";
import { useDialogDescription } from "../dialog/dialog-description.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { PopoverStore } from "./popover-store.js";

/**
 * Returns props to create a `PopoverDescription` component. This hook must be
 * used in a component that's wrapped with `Popover` so the `aria-describedby`
 * prop is properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * // This component must be wrapped with Popover
 * const props = usePopoverDescription();
 * <Role {...props}>Description</Role>
 * ```
 */
export const usePopoverDescription =
  createHook2<TagNamePopoverDescriptionOptions>((props) => {
    props = useDialogDescription(props);
    return props;
  });

/**
 * Renders a description in a popover. This component must be wrapped with
 * [`Popover`](https://ariakit.org/reference/popover) so the `aria-describedby`
 * prop is properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx {3}
 * <PopoverProvider>
 *   <Popover>
 *     <PopoverDescription>Description</PopoverDescription>
 *   </Popover>
 * </PopoverProvider>
 * ```
 */
export const PopoverDescription = forwardRef(function PopoverDescription(
  props: PopoverDescriptionProps,
) {
  const htmlProps = usePopoverDescription(props);
  return createElement(TagName, htmlProps);
});

export interface PopoverDescriptionOptions<T extends ElementType = TagName>
  extends DialogDescriptionOptions<T> {
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

export type PopoverDescriptionProps<T extends ElementType = TagName> = Props2<
  T,
  PopoverDescriptionOptions<T>
>;
