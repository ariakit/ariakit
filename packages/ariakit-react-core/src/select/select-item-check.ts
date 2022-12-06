import { useContext } from "react";
import {
  CheckboxCheckOptions,
  useCheckboxCheck,
} from "../checkbox/checkbox-check";
import { createComponent, createElement, createHook } from "../utils/system";
import { As, Props } from "../utils/types";
import { SelectItemCheckedContext } from "./select-context";
import { SelectStore } from "./select-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a checkmark inside a `SelectItem` component. This
 * hook must be used in a component that's wrapped with `SelectItem` or the
 * `checked` prop must be explicitly passed to the component.
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
  }
);

/**
 * A component that renders a checkmark inside a `SelectItem` component. This
 * component must be wrapped with `SelectItem` or the `checked` prop must be
 * explicitly passed to the component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectStore();
 * <Select store={select} />
 * <SelectPopover store={select}>
 *   <SelectItem value="Apple">
 *     <SelectItemCheck />
 *     Apple
 *   </SelectItem>
 *   <SelectItem value="Orange">
 *     <SelectItemCheck />
 *     Orange
 *   </SelectItem>
 * </SelectPopover>
 * ```
 */
export const SelectItemCheck = createComponent<SelectItemCheckOptions>(
  (props) => {
    const htmlProps = useSelectItemCheck(props);
    return createElement("span", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  SelectItemCheck.displayName = "SelectItemCheck";
}

export type SelectItemCheckOptions<T extends As = "span"> = Omit<
  CheckboxCheckOptions<T>,
  "store" | "checked"
> & {
  /**
   * Object returned by the `useSelectStore` hook. If not provided, the parent
   * `SelectList` or `SelectPopover` components' context will be used.
   */
  store?: SelectStore;
  /**
   * Whether the check mark should be shown. This value is automatically
   * inferred from the parent `SelectItem` component. Manually setting this prop
   * will override the inferred value.
   */
  checked?: boolean;
};

export type SelectItemCheckProps<T extends As = "span"> = Props<
  SelectItemCheckOptions<T>
>;
