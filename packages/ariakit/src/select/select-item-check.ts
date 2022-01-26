import { useContext } from "react";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CheckboxCheckOptions,
  useCheckboxCheck,
} from "../checkbox/checkbox-check";
import { SelectItemCheckedContext } from "./__utils";
import { SelectState } from "./select-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a checkmark inside a `SelectItemCheckbox` or
 * `SelectItemRadio` components. This hook must be used in a component that's
 * wrapped with one of those components or the `checked` prop must be explicitly
 * passed to the component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const props = useSelectItemCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export const useSelectItemCheck = createHook<SelectItemCheckOptions>(
  ({ state, checked, ...props }) => {
    // TODO: Fix delay when selectOnMove is true
    const context = useContext(SelectItemCheckedContext);
    checked = checked ?? context;
    props = useCheckboxCheck({ ...props, checked });
    return props;
  }
);

/**
 * A component that renders a checkmark inside a `SelectItemCheckbox` or
 * `SelectItemRadio` components. This component must be wrapped with one of those
 * components or the `checked` prop must be explicitly passed to the component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState({
 *   defaultValues: { apple: true, orange: false },
 * });
 * <SelectButton state={select}>Fruits</SelectButton>
 * <Select state={select}>
 *   <SelectItemCheckbox name="apple">
 *     <SelectItemCheck />
 *     Apple
 *   </SelectItemCheckbox>
 *   <SelectItemCheckbox name="orange">
 *     <SelectItemCheck />
 *     Orange
 *   </SelectItemCheckbox>
 * </Select>
 * ```
 */
export const SelectItemCheck = createComponent<SelectItemCheckOptions>(
  (props) => {
    const htmlProps = useSelectItemCheck(props);
    return createElement("span", htmlProps);
  }
);

export type SelectItemCheckOptions<T extends As = "span"> = Omit<
  CheckboxCheckOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useSelectState` hook.
   */
  state?: SelectState;
};

export type SelectItemCheckProps<T extends As = "span"> = Props<
  SelectItemCheckOptions<T>
>;
