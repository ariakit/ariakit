import type { CompositeGroupLabelOptions } from "../composite/composite-group-label.js";
import { useCompositeGroupLabel } from "../composite/composite-group-label.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { SelectStore } from "./select-store.js";

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
export const useSelectGroupLabel = createHook<SelectGroupLabelOptions>(
  (props) => {
    props = useCompositeGroupLabel(props);
    return props;
  },
);

/**
 * Renders a label in a select group. This component must be wrapped with
 * `SelectGroup` so the `aria-labelledby` prop is properly set on the select
 * group element.
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
export const SelectGroupLabel = createComponent<SelectGroupLabelOptions>(
  (props) => {
    const htmlProps = useSelectGroupLabel(props);
    return createElement("div", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  SelectGroupLabel.displayName = "SelectGroupLabel";
}

export interface SelectGroupLabelOptions<T extends As = "div">
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

export type SelectGroupLabelProps<T extends As = "div"> = Props<
  SelectGroupLabelOptions<T>
>;
