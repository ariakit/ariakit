"use client";
import type { CompositeGroupOptions } from "../composite/composite-group.js";
import { useCompositeGroup } from "../composite/composite-group.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { SelectStore } from "./select-store.js";

/**
 * Returns props to create a `SelectGroup` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectGroup({ store });
 * <Select store={store} />
 * <SelectPopover store={store}>
 *   <Role {...props}>
 *     <SelectGroupLabel>Fruits</SelectGroupLabel>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </Role>
 * </SelectPopover>
 * ```
 */
export const useSelectGroup = createHook<SelectGroupOptions>((props) => {
  props = useCompositeGroup(props);
  return props;
});

/**
 * Renders a select group.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {4-8}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectGroup>
 *       <SelectGroupLabel>Fruits</SelectGroupLabel>
 *       <SelectItem value="Apple" />
 *       <SelectItem value="Orange" />
 *     </SelectGroup>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectGroup = createComponent<SelectGroupOptions>((props) => {
  const htmlProps = useSelectGroup(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  SelectGroup.displayName = "SelectGroup";
}

export interface SelectGroupOptions<T extends As = "div">
  extends CompositeGroupOptions<T> {
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

export type SelectGroupProps<T extends As = "div"> = Props<
  SelectGroupOptions<T>
>;
