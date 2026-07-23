import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import type { PopoverAnchorOptions } from "../popover/popover-anchor.tsx";
import { usePopoverAnchor } from "../popover/popover-anchor.tsx";
import { useSelectProviderContext } from "./select-context.tsx";
import type { SelectStore } from "./select-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `SelectAnchor` component.
 * @see https://ariakit.com/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectAnchor({ store });
 * <Role {...props}>Anchor</Role>
 * <Select store={store} />
 * <SelectPopover store={store}>Content</SelectPopover>
 * ```
 */
export const useSelectAnchor = createHook<TagName, SelectAnchorOptions>(
  function useSelectAnchor({ store, ...props }) {
    const context = useSelectProviderContext();
    store = store || context;
    return usePopoverAnchor({ store, ...props });
  },
);

/**
 * Renders an element that acts as the anchor for the
 * [`SelectPopover`](https://ariakit.com/reference/select-popover) component.
 * @see https://ariakit.com/components/select
 * @example
 * ```jsx {3}
 * <SelectProvider>
 *   <Select />
 *   <SelectAnchor>Anchor</SelectAnchor>
 *   <SelectPopover>Content</SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectAnchor = forwardRef(function SelectAnchor(
  props: SelectAnchorProps,
) {
  const htmlProps = useSelectAnchor(props);
  return createElement(TagName, htmlProps);
});

export interface SelectAnchorOptions<
  T extends ElementType = TagName,
> extends PopoverAnchorOptions<T> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.com/reference/use-select-store) hook. If
   * not provided, the closest
   * [`SelectProvider`](https://ariakit.com/reference/select-provider)
   * component's context will be used.
   */
  store?: SelectStore;
}

export type SelectAnchorProps<T extends ElementType = TagName> = Props<
  T,
  SelectAnchorOptions<T>
>;
