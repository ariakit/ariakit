import { useContext } from "react";
import type { CheckboxCheckOptions } from "../checkbox/checkbox-check.js";
import { useCheckboxCheck } from "../checkbox/checkbox-check.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { SelectItemCheckedContext } from "./select-context.js";
import type { SelectStore } from "./select-store.js";

/**
 * Returns props to create a `SelectItemCheck` component. This hook must be used
 * in a component that's wrapped with `SelectItem` or the `checked` prop must be
 * explicitly passed to the component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const props = useSelectItemCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export const useSelectItemCheck = createHook<SelectItemCheckOptions>(
  ({ store, checked, ...props }) => {
    const context = useContext(SelectItemCheckedContext);
    checked = checked ?? context;
    props = useCheckboxCheck({ ...props, checked });
    return props;
  },
);

/**
 * Renders a checkmark inside a `SelectItem` component. This component must be
 * wrapped with `SelectItem` or the `checked` prop must be explicitly passed to
 * the component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Apple">
 *       <SelectItemCheck />
 *       Apple
 *     </SelectItem>
 *     <SelectItem value="Orange">
 *       <SelectItemCheck />
 *       Orange
 *     </SelectItem>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export const SelectItemCheck = createComponent<SelectItemCheckOptions>(
  (props) => {
    const htmlProps = useSelectItemCheck(props);
    return createElement("span", htmlProps);
  },
);

if (process.env.NODE_ENV !== "production") {
  SelectItemCheck.displayName = "SelectItemCheck";
}

export interface SelectItemCheckOptions<T extends As = "span">
  extends CheckboxCheckOptions<T> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
   * not provided, the parent
   * [`SelectList`](https://ariakit.org/reference/select-list) or
   * [`SelectPopover`](https://ariakit.org/reference/select-popover) components'
   * context will be used.
   */
  store?: SelectStore;
  /**
   * Whether the check mark should be shown. This value is automatically
   * inferred from the parent
   * [`SelectItem`](https://ariakit.org/reference/select-item) component.
   * Manually setting this prop will override the inferred value.
   */
  checked?: boolean;
}

export type SelectItemCheckProps<T extends As = "span"> = Props<
  SelectItemCheckOptions<T>
>;
