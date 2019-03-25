import * as React from "react";
import { useSealedState, SealedInitialState } from "../__utils/useSealedState";
import { Keys } from "../__utils/types";

export type unstable_CheckboxState = {
  /**
   * Stores the state of the checkbox.
   * If checkboxes that share this state have defined a `value` prop, it's
   * going to be an array.
   * @default false
   */
  currentValue: boolean | "indeterminate" | any[];
};

export type unstable_CheckboxActions = {
  /**
   * Sets `currentValue`.
   */
  setValue: React.Dispatch<
    React.SetStateAction<unstable_CheckboxState["currentValue"]>
  >;
};

export type unstable_CheckboxInitialState = Partial<
  Pick<unstable_CheckboxState, "currentValue">
>;

export type unstable_CheckboxStateReturn = unstable_CheckboxState &
  unstable_CheckboxActions;

/**
 * As simple as `React.useState(false)`
 */
export function useCheckboxState(
  initialState: SealedInitialState<unstable_CheckboxInitialState> = {}
): unstable_CheckboxStateReturn {
  const { currentValue: initialCurrentValue = false } = useSealedState(
    initialState
  );
  const [currentValue, setValue] = React.useState(initialCurrentValue);

  return {
    currentValue,
    setValue
  };
}

const keys: Keys<unstable_CheckboxStateReturn> = ["currentValue", "setValue"];

useCheckboxState.__keys = keys;
