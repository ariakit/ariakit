import type { ElementType } from "react";
import type { DialogDescriptionOptions } from "../dialog/dialog-description.ts";
import { useDialogDescription } from "../dialog/dialog-description.ts";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import type { PopoverStore } from "./popover-store.ts";

const TagName = "p" satisfies ElementType;
type TagName = typeof TagName;

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
export const usePopoverDescription = createHook<
  TagName,
  PopoverDescriptionOptions
>(function usePopoverDescription(props) {
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

export type PopoverDescriptionProps<T extends ElementType = TagName> = Props<
  T,
  PopoverDescriptionOptions<T>
>;
