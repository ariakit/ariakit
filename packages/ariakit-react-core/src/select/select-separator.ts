import type { CompositeSeparatorOptions } from "../composite/composite-separator.js";
import { useCompositeSeparator } from "../composite/composite-separator.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useSelectContext } from "./select-context.js";
import type { SelectStore } from "./select-store.js";

/**
 * Returns props to create a `SelectSeparator` component.
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
export const useSelectSeparator = createHook2<TagName, SelectSeparatorOptions>(
  ({ store, ...props }) => {
    const context = useSelectContext();
    store = store || context;
    props = useCompositeSeparator({ store, ...props });
    return props;
  },
);

/**
 * Renders a divider between
 * [`SelectItem`](https://ariakit.org/reference/select-item) elements.
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
  return createElement("hr", htmlProps);
});

export interface SelectSeparatorOptions<T extends As = "hr">
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

export type SelectSeparatorProps<T extends As = "hr"> = Props<
  SelectSeparatorOptions<T>
>;
