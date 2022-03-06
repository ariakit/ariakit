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
  ({ state, checked, ...props }) => {
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
 * const select = useSelectState();
 * <Select state={select} />
 * <SelectPopover state={select}>
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

export type SelectItemCheckOptions<T extends As = "span"> = Omit<
  CheckboxCheckOptions<T>,
  "state" | "checked"
> & {
  /**
   * Object returned by the `useSelectState` hook. If not provided, the parent
   * `SelectList` or `SelectPopover` components' context will be used.
   */
  state?: SelectState;
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
