import * as React from "react";
import { useSealedState, SealedInitialState } from "../__utils/useSealedState";
import { removeIndexFromArray } from "../__utils/removeIndexFromArray";

export type unstable_CheckboxState = {
  /** TODO: Description */
  state: 0 | 1 | 2 | any[];
};

export type unstable_CheckboxActions = {
  /** TODO: Description */
  update: React.Dispatch<React.SetStateAction<unstable_CheckboxState["state"]>>;
  /** TODO: Description */
  toggle: (value?: any) => void;
};

export type unstable_CheckboxInitialState = Partial<
  Pick<unstable_CheckboxState, "state">
>;

export type unstable_CheckboxStateReturn = unstable_CheckboxState &
  unstable_CheckboxActions;

export function useCheckboxState(
  initialState: SealedInitialState<unstable_CheckboxInitialState> = {}
): unstable_CheckboxStateReturn {
  const { state: defaultState = 0 } = useSealedState(initialState);
  const [state, update] = React.useState(defaultState);

  const toggle = React.useCallback(value => {
    const isBoolean = typeof value === "undefined";
    if (isBoolean) {
      update(s => (s ? 0 : 1));
    } else {
      update(s => {
        const array: any[] = Array.isArray(s) ? s : [];
        const index = array.indexOf(value);
        if (index === -1) {
          return [...array, value];
        }
        return removeIndexFromArray(array, index);
      });
    }
  }, []);

  return {
    state,
    update,
    toggle
  };
}

const keys: Array<keyof unstable_CheckboxStateReturn> = [
  "state",
  "update",
  "toggle"
];

useCheckboxState.keys = keys;
