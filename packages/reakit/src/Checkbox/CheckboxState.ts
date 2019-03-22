import * as React from "react";
import { useSealedState, SealedInitialState } from "../__utils/useSealedState";
import { removeIndexFromArray } from "../__utils/removeIndexFromArray";

export type unstable_CheckboxState = {
  /** TODO: Description */
  currentValue: 0 | 1 | 2 | any[];
};

export type unstable_CheckboxActions = {
  /** TODO: Description */
  setValue: React.Dispatch<
    React.SetStateAction<unstable_CheckboxState["currentValue"]>
  >;
  /** TODO: Description */
  toggle: (value?: any) => void;
};

export type unstable_CheckboxInitialState = Partial<
  Pick<unstable_CheckboxState, "currentValue">
>;

export type unstable_CheckboxStateReturn = unstable_CheckboxState &
  unstable_CheckboxActions;

export function useCheckboxState(
  initialState: SealedInitialState<unstable_CheckboxInitialState> = {}
): unstable_CheckboxStateReturn {
  const { currentValue: initialCurrentValue = 0 } = useSealedState(
    initialState
  );
  const [currentValue, setValue] = React.useState(initialCurrentValue);

  const toggle = React.useCallback(value => {
    const isBoolean = typeof value === "undefined";
    if (isBoolean) {
      setValue(v => (v ? 0 : 1));
    } else {
      setValue(v => {
        const array: any[] = Array.isArray(v) ? v : [];
        const index = array.indexOf(value);
        if (index === -1) {
          return [...array, value];
        }
        return removeIndexFromArray(array, index);
      });
    }
  }, []);

  return {
    currentValue,
    setValue,
    toggle
  };
}

const keys: Array<keyof unstable_CheckboxStateReturn> = [
  "currentValue",
  "setValue",
  "toggle"
];

useCheckboxState.keys = keys;
