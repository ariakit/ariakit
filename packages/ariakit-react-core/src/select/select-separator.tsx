import type { ElementType } from "react";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.tsx";
import { useCompositeSeparator } from "../composite/composite-separator.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useSelectContext } from "./select-context.tsx";
import type { SelectStore } from "./select-store.ts";

const TagName = "hr" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `SelectSeparator` component.
 * @deprecated Use `useSelectGroup` with CSS borders instead.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectSeparator({ store });
 * <SelectPopover store={store}>
 *   <SelectItem value="Item 1" />
 *   <Role {...props} />
 *   <SelectItem value="Item 2" />
 *   <SelectItem value="Item 3" />
 * </SelectPopover>
 * ```
 */
export const useSelectSeparator = createHook<TagName, SelectSeparatorOptions>(
  function useSelectSeparator({ store, ...props }) {
    const context = useSelectContext();
    store = store || context;
    props = useCompositeSeparator({ store, ...props });
    return props;
  },
);

/**
 * Renders a divider between
 * [`SelectItem`](https://ariakit.org/reference/select-item) elements.
 * @deprecated Use [`SelectGroup`](https://ariakit.org/reference/select-group)
 * with CSS borders instead.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {5}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Item 1" />
 *     <SelectSeparator />
 *     <SelectItem value="Item 2" />
 *     <SelectItem value="Item 3" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectSeparator = forwardRef(function SelectSeparator(
  props: SelectSeparatorProps,
) {
  const htmlProps = useSelectSeparator(props);
  return createElement(TagName, htmlProps);
});

export interface SelectSeparatorOptions<T extends ElementType = TagName>
  extends CompositeSeparatorOptions<T> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
   * not provided, the parent
   * [`SelectList`](https://ariakit.org/reference/select-list) or
   * [`SelectPopover`](https://ariakit.org/reference/select-popover) components'
   * context will be used.
   */
  store?: SelectStore;
}

export type SelectSeparatorProps<T extends ElementType = TagName> = Props<
  T,
  SelectSeparatorOptions<T>
>;
