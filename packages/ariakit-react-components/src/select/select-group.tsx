import { createElement, createHook, forwardRef } from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import type { ElementType } from "react";
import type { CompositeGroupOptions } from "../composite/composite-group.tsx";
import { useCompositeGroup } from "../composite/composite-group.tsx";
import type { SelectStore } from "./select-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `SelectGroup` component.
 * @deprecated Use `useComboboxGroup` instead.
 * @see https://ariakit.com/components/select
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
 * Renders a group for [`SelectItem`](https://ariakit.com/reference/select-item)
 * elements. Optionally, a
 * [`SelectGroupLabel`](https://ariakit.com/reference/select-group-label) can be
 * rendered as a child to provide a label for the group.
 * @deprecated Use
 * [`ComboboxGroup`](https://ariakit.com/reference/combobox-group) instead.
 * @see https://ariakit.com/components/select
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

/** @deprecated Use `ComboboxGroupOptions` instead. */
export interface SelectGroupOptions<
  T extends ElementType = TagName,
> extends CompositeGroupOptions<T> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.com/reference/use-select-store) hook. If
   * not provided, the parent
   * [`SelectList`](https://ariakit.com/reference/select-list) or
   * [`SelectPopover`](https://ariakit.com/reference/select-popover) components'
   * context will be used.
   */
  store?: SelectStore;
}

/** @deprecated Use `ComboboxGroupProps` instead. */
export type SelectGroupProps<T extends ElementType = TagName> = Props<
  T,
  SelectGroupOptions<T>
>;
