import * as React from "react";
import {
  unstable_useSealedState,
  unstable_SealedInitialState
} from "../utils/useSealedState";

export type CheckboxState = {
  /**
   * Stores the state of the checkbox.
   * If checkboxes that share this state have defined a `value` prop, it's
   * going to be an array.
   */
  state: boolean | "indeterminate" | any[];
};

export type CheckboxActions = {
  /**
   * Sets `state`.
   */
  setState: React.Dispatch<React.SetStateAction<CheckboxState["state"]>>;
};

export type CheckboxInitialState = Partial<Pick<CheckboxState, "state">>;

export type CheckboxStateReturn = CheckboxState & CheckboxActions;

/**
 * As simple as `React.useState(false)`
 */
export function useCheckboxState(
  initialState: unstable_SealedInitialState<CheckboxInitialState> = {}
): CheckboxStateReturn {
  const { state: initialValue = false } = unstable_useSealedState(initialState);
  const [state, setState] = React.useState(initialValue);

  return {
    state,
    setState
  };
}

const keys: Array<keyof CheckboxStateReturn> = ["state", "setState"];

useCheckboxState.__keys = keys;
