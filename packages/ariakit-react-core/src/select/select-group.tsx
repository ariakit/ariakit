import type { ElementType } from "react";
import type { CompositeGroupOptions } from "../composite/composite-group.tsx";
import { useCompositeGroup } from "../composite/composite-group.tsx";
import type { StoreProp } from "../utils/system.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import type { SelectStore } from "./select-store.ts";

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

export interface SelectGroupOptions<
  T extends ElementType = TagName,
> extends CompositeGroupOptions<T> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook.
   * This prop can also receive the corresponding
   * [`SelectProvider`](https://ariakit.org/reference/select-provider)
   * component, which makes the component read the store from that provider's
   * context explicitly, or `null`, which disables context lookup.
   * If not provided, the closest
   * [`SelectProvider`](https://ariakit.org/reference/select-provider)
   * component's context will be used.
   */
  store?: StoreProp<SelectStore>;
}

export type SelectGroupProps<T extends ElementType = TagName> = Props<
  T,
  SelectGroupOptions<T>
>;
