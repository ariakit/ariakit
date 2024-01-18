import { useContext } from "react";
import type { ElementType } from "react";
import type { CheckboxCheckOptions } from "../checkbox/checkbox-check.js";
import { useCheckboxCheck } from "../checkbox/checkbox-check.js";
import { createElement, createHook, forwardRef } from "../utils/system.js";
import type { Props } from "../utils/types.js";
import { SelectItemCheckedContext } from "./select-context.js";
import type { SelectStore } from "./select-store.js";

const TagName = "span" satisfies ElementType;
type TagName = typeof TagName;

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
export const useSelectItemCheck = createHook<TagName, SelectItemCheckOptions>(
  function useSelectItemCheck({ store, checked, ...props }) {
    const context = useContext(SelectItemCheckedContext);
    checked = checked ?? context;
    props = useCheckboxCheck({ ...props, checked });
    return props;
  },
);

/**
 * Renders a checkmark icon when the
 * [`checked`](https://ariakit.org/reference/select-item-check#checked) prop is
 * `true`. The icon can be overridden by providing a different one as children.
 *
 * When rendered inside a
 * [`SelectItem`](https://ariakit.org/reference/select-item) component, the
 * [`checked`](https://ariakit.org/reference/select-item-check#checked) prop is
 * automatically derived from the context.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {5,9}
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
export const SelectItemCheck = forwardRef(function SelectItemCheck(
  props: SelectItemCheckProps,
) {
  const htmlProps = useSelectItemCheck(props);
  return createElement(TagName, htmlProps);
});

export interface SelectItemCheckOptions<T extends ElementType = TagName>
  extends CheckboxCheckOptions<T> {
  /**
   * Object returned by the
   * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook.
   */
  store?: SelectStore;
}

export type SelectItemCheckProps<T extends ElementType = TagName> = Props<
  T,
  SelectItemCheckOptions<T>
>;
