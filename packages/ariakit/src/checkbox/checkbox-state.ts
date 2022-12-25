import { useMemo } from "react";
import { useControlledState } from "ariakit-react-utils/hooks";
import { SetState } from "ariakit-utils/types";

type CheckboxStateValue = boolean | string | number | Array<string | number>;

/**
 * Provides state for the `Checkbox` component.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * const checkbox = useCheckboxState({ defaultChecked: true });
 * <Checkbox state={checkbox} />
 * ```
 */
export function useCheckboxState<
  T extends CheckboxStateValue = CheckboxStateValue
>(props: CheckboxStateProps<T> = {}): CheckboxState<T> {
  const [value, setValue] = useControlledState(
    props.defaultValue ?? (false as T),
    props.value,
    props.setValue
  );
  const state = useMemo(() => ({ value, setValue }), [value, setValue]);
  return state;
}

export type CheckboxState<T extends CheckboxStateValue = CheckboxStateValue> = {
  /**
   * The checked state of the checkbox.
   */
  value: T;
  /**
   * Sets the `value` state.
   * @example
   * const checkbox = useCheckboxState({ defaultValue: false });
   * checkbox.setValue(true);
   */
  setValue: SetState<T>;
};

export type CheckboxStateProps<
  T extends CheckboxStateValue = CheckboxStateValue
> = Partial<Pick<CheckboxState<T>, "value">> & {
  /**
   * The default value of the checkbox.
   * @default false
   * @example
   * const checkbox = useCheckboxState({ defaultValue: ["Apple", "Orange"] });
   * <Checkbox state={checkbox} value="Apple" />
   * <Checkbox state={checkbox} value="Orange" />
   * <Checkbox state={checkbox} value="Watermelon" />
   */
  defaultValue?: T;
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
  setValue?: (value: T) => void;
};
