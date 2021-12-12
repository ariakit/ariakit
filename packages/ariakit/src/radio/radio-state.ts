import { useMemo, useState } from "react";
import { useStorePublisher } from "ariakit-utils/store";
import { SetState } from "ariakit-utils/types";
import {
  CompositeState,
  CompositeStateProps,
  useCompositeState,
} from "../composite/composite-state";

/**
 * Provides state for the `Radio` components.
 * @example
 * ```jsx
 * const radio = useRadioState();
 * <RadioGroup state={radio}>
 *   <Radio value="Apple" />
 *   <Radio value="Orange" />
 * </RadioGroup>
 * ```
 */
export function useRadioState({
  focusLoop = true,
  ...props
}: RadioStateProps = {}): RadioState {
  const [_value, _setValue] = useState(
    props.value ?? props.defaultValue ?? null
  );
  const value = props.value ?? _value;
  const setValue = props.setValue || _setValue;

  const composite = useCompositeState({ focusLoop, ...props });

  const state = useMemo(
    () => ({ ...composite, value, setValue }),
    [composite, value, setValue]
  );

  return useStorePublisher(state);
}

export type RadioState = CompositeState & {
  /**
   * The current value of the radio group.
   */
  value: string | number | null;
  /**
   * Sets the `value` state.
   */
  setValue: SetState<RadioState["value"]>;
};

export type RadioStateProps = CompositeStateProps &
  Partial<Pick<RadioState, "value">> & {
    /**
     * The initial value of the radio group.
     */
    defaultValue?: RadioState["value"];
    /**
     * Function that will be called when setting the radio `value` state.
     * @example
     * function RadioGroup({ value, onChange }) {
     *   const radio = useRadioState({ value, setValue: onChange });
     * }
     */
    setValue?: (value: RadioState["value"]) => void;
  };
