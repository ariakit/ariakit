"use client";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.js";
import { useCompositeSeparator } from "../composite/composite-separator.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
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
export const useSelectSeparator = createHook<SelectSeparatorOptions>(
  ({ store, ...props }) => {
    const context = useSelectContext();
    store = store || context;
    props = useCompositeSeparator({ store, ...props });
    return props;
  },
);

/**
 * Renders a separator element for select items.
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
export const SelectSeparator = createComponent<SelectSeparatorOptions>(
  (props) => {
    const htmlProps = useSelectSeparator(props);
    return createElement("hr", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  SelectSeparator.displayName = "SelectSeparator";
}

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
