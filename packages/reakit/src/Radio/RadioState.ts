import * as React from "react";
import {
  useSealedState,
  SealedInitialState
} from "reakit-utils/useSealedState";
import {
  unstable_CompositeState as CompositeState,
  unstable_CompositeActions as CompositeActions,
  unstable_CompositeInitialState as CompositeInitialState,
  unstable_useCompositeState as useCompositeState
} from "../Composite";

export type RadioState = CompositeState & {
  /**
   * The `value` attribute of the current checked radio.
   */
  state: any;
};

export type RadioActions = CompositeActions & {
  /**
   * Sets `state`.
   */
  setState: React.Dispatch<React.SetStateAction<any>>;
};

export type RadioInitialState = CompositeInitialState &
  Partial<Pick<RadioState, "state">>;

export type RadioStateReturn = RadioState & RadioActions;

export function useRadioState(
  initialState: SealedInitialState<RadioInitialState> = {}
): RadioStateReturn {
  const { state: initialValue, loop = true, ...sealed } = useSealedState(
    initialState
  );
  const [state, setState] = React.useState(initialValue);
  const composite = useCompositeState({ ...sealed, loop });
  return {
    ...composite,
    state,
    setState
  };
}

const keys: Array<keyof RadioStateReturn> = [
  ...useCompositeState.__keys,
  "state",
  "setState"
];

useRadioState.__keys = keys;
