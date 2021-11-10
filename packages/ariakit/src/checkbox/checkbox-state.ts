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
   * A memoized function that will be called to update the value.
   * @example
   * const [value, setValue] = useState(false);
   * useCheckboxState({ value, setValue });
   */
  setValue: SetState<CheckboxState["value"]>;
};

export type CheckboxStateProps = Partial<
  Pick<CheckboxState, "value" | "setValue">
> & {
  /**
   * The default value of the checkbox.
   * @default false
   */
  defaultValue?: CheckboxState["value"];
};
