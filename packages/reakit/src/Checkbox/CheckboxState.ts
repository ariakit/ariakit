import * as React from "react";
import { useSealedState, SealedInitialState } from "../__utils/useSealedState";
import { Keys } from "../__utils/types";

export type CheckboxState = {
  /**
   * Stores the state of the checkbox.
   * If checkboxes that share this state have defined a `value` prop, it's
   * going to be an array.
   */
  currentValue: boolean | "indeterminate" | any[];
};

export type CheckboxActions = {
  /**
   * Sets `currentValue`.
   */
  setValue: React.Dispatch<React.SetStateAction<CheckboxState["currentValue"]>>;
};

export type CheckboxInitialState = Partial<Pick<CheckboxState, "currentValue">>;

export type CheckboxStateReturn = CheckboxState & CheckboxActions;

/**
 * As simple as `React.useState(false)`
 */
export function useCheckboxState(
  initialState: SealedInitialState<CheckboxInitialState> = {}
): CheckboxStateReturn {
  const { currentValue: initialCurrentValue = false } = useSealedState(
    initialState
  );
  const [currentValue, setValue] = React.useState(initialCurrentValue);

  return {
    currentValue,
    setValue
  };
}

const keys: Keys<CheckboxStateReturn> = ["currentValue", "setValue"];

useCheckboxState.__keys = keys;
