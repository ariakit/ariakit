import type { ElementType } from "react";
import type { CompositeGroupOptions } from "../composite/composite-group.js";
import { useCompositeGroup } from "../composite/composite-group.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import type { SelectStore } from "./select-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

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
export const useSelectGroup = createHook<TagName, SelectGroupOptions>(
  function useSelectGroup(props) {
    props = useCompositeGroup(props);
    return props;
  },
);

/**
 * Renders a group for [`SelectItem`](https://ariakit.org/reference/select-item)
 * elements. Optionally, a
 * [`SelectGroupLabel`](https://ariakit.org/reference/select-group-label) can be
 * rendered as a child to provide a label for the group.
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
export const SelectGroup = forwardRef(function SelectGroup(
  props: SelectGroupProps,
) {
  const htmlProps = useSelectGroup(props);
  return createElement(TagName, htmlProps);
});

export interface SelectGroupOptions<T extends ElementType = TagName>
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

export type SelectGroupProps<T extends ElementType = TagName> = Props<
  T,
  SelectGroupOptions<T>
>;
