import type { ElementType } from "react";
import type { CompositeGroupLabelOptions } from "../composite/composite-group-label.tsx";
import { useCompositeGroupLabel } from "../composite/composite-group-label.tsx";
import { createElement, createHook, forwardRef } from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import type { SelectStore } from "./select-store.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `SelectGroupLabel` component. This hook must be
 * used in a component that's wrapped with `SelectGroup` so the
 * `aria-labelledby` prop is properly set on the select group element.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * // This component must be wrapped with SelectGroup
 * const props = useSelectGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export const useSelectGroupLabel = createHook<TagName, SelectGroupLabelOptions>(
  function useSelectGroupLabel(props) {
    props = useCompositeGroupLabel(props);
    return props;
  },
);

/**
 * Renders a label in a select group. This component must be wrapped with
 * [`SelectGroup`](https://ariakit.org/reference/select-group) so the
 * `aria-labelledby` prop is properly set on the select group element.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {5,10}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectGroup>
 *       <SelectGroupLabel>Fruits</SelectGroupLabel>
 *       <SelectItem value="Apple" />
 *       <SelectItem value="Orange" />
 *     </SelectGroup>
 *     <SelectGroup>
 *       <SelectGroupLabel>Meat</SelectGroupLabel>
 *       <SelectItem value="Beef" />
 *       <SelectItem value="Chicken" />
 *     </SelectGroup>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectGroupLabel = forwardRef(function SelectGroupLabel(
  props: SelectGroupLabelProps,
) {
  const htmlProps = useSelectGroupLabel(props);
  return createElement(TagName, htmlProps);
});

export interface SelectGroupLabelOptions<T extends ElementType = TagName>
  extends CompositeGroupLabelOptions<T> {
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

export type SelectGroupLabelProps<T extends ElementType = TagName> = Props<
  T,
  SelectGroupLabelOptions<T>
>;
