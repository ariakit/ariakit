import * as React from "react";
import { useSealedState, SealedInitialState } from "../__utils/useSealedState";

export type unstable_CheckboxState = {
  /** TODO: Description */
  currentValue: boolean | "indeterminate" | any[];
};

export type unstable_CheckboxActions = {
  /** TODO: Description */
  setValue: React.Dispatch<
    React.SetStateAction<unstable_CheckboxState["currentValue"]>
  >;
};

export type unstable_CheckboxInitialState = Partial<
  Pick<unstable_CheckboxState, "currentValue">
>;

export type unstable_CheckboxStateReturn = unstable_CheckboxState &
  unstable_CheckboxActions;

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

const keys: Array<keyof unstable_CheckboxStateReturn> = [
  "currentValue",
  "setValue"
];

useCheckboxState.keys = keys;
