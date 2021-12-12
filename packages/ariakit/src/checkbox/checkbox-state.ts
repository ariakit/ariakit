import { useMemo } from "react";
import { useControlledState } from "ariakit-utils/hooks";
import { SetState } from "ariakit-utils/types";

/**
 * Provides state for the `Checkbox` component.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * const checkbox = useCheckboxState({ defaultChecked: true });
 * <Checkbox state={checkbox} />
 * ```
 */
export function useCheckboxState(
  props: CheckboxStateProps = {}
): CheckboxState {
  const [value, setValue] = useControlledState(
    props.defaultValue ?? false,
    props.value,
    props.setValue
  );
  const state = useMemo(() => ({ value, setValue }), [value, setValue]);
  return state;
}

export type CheckboxState = {
  /**
   * The checked state of the checkbox.
   */
  value: boolean | string | number | Array<string | number>;
  /**
   * Sets the `value` state.
   * @example
   * const checkbox = useCheckboxState({ defaultValue: false });
   * checkbox.setValue(true);
   */
  setValue: SetState<CheckboxState["value"]>;
};

export type CheckboxStateProps = Partial<Pick<CheckboxState, "value">> & {
  /**
   * The default value of the checkbox.
   * @default false
   * @example
   * const checkbox = useCheckboxState({ defaultValue: ["Apple", "Orange"] });
   * <Checkbox state={checkbox} value="Apple" />
   * <Checkbox state={checkbox} value="Orange" />
   * <Checkbox state={checkbox} value="Watermelon" />
   */
  defaultValue?: CheckboxState["value"];
  /**
   * Function that will be called when setting the checkbox `value` state.
   * @example
   * // Uncontrolled example
   * useCheckboxState({ setValue: (value) => console.log(value) });
   * @example
   * // Controlled example
   * const [value, setValue] = useState(false);
   * useCheckboxState({ value, setValue });
   * @example
   * // Externally controlled example
   * function CheckboxGroup({ value, onChange }) {
   *   const checkbox = useCheckboxState({ value, setValue: onChange });
   * }
   */
  setValue?: (value: CheckboxState["value"]) => void;
};
