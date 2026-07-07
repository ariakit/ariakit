import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Props, ProviderComponent } from "@ariakit/react-utils";
import type { ElementType } from "react";
import type { DialogHeadingOptions } from "../dialog/dialog-heading.tsx";
import { useDialogHeading } from "../dialog/dialog-heading.tsx";
import type { PopoverStore } from "./popover-store.ts";

const TagName = "h1" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `PopoverHeading` component. This hook must be used
 * in a component that's wrapped with `Popover` so the `aria-labelledby` prop is
 * properly set on the popover element.
 * @see https://ariakit.com/components/popover
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
 * [`Popover`](https://ariakit.com/reference/popover) so the `aria-labelledby`
 * prop is properly set on the popover element.
 * @see https://ariakit.com/components/popover
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

export interface PopoverHeadingOptions<
  T extends ElementType = TagName,
> extends DialogHeadingOptions<T> {
  /**
   * Object returned by the
   * [`usePopoverStore`](https://ariakit.com/reference/use-popover-store) hook.
   *
   * **Note**: This prop has no effect on this component. The heading is
   * linked to the closest [`Popover`](https://ariakit.com/reference/popover)
   * component through React context, so it must be rendered inside the popover
   * for the `aria-labelledby` prop to be set on the popover element.
   */
  store?: PopoverStore | ProviderComponent<PopoverStore>;
}

export type PopoverHeadingProps<T extends ElementType = TagName> = Props<
  T,
  PopoverHeadingOptions<T>
>;
