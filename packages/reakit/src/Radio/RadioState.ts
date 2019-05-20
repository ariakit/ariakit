import * as React from "react";
import {
  unstable_useSealedState,
  unstable_SealedInitialState
} from "../utils/useSealedState";
import {
  RoverState,
  RoverActions,
  RoverInitialState,
  useRoverState
} from "../Rover";

export type RadioState = RoverState & {
  /**
   * The `value` attribute of the current checked radio.
   */
  state: any;
};

export type RadioActions = RoverActions & {
  /**
   * Sets `state`.
   */
  setState: React.Dispatch<React.SetStateAction<any>>;
};

export type RadioInitialState = RoverInitialState &
  Partial<Pick<RadioState, "state">>;

export type RadioStateReturn = RadioState & RadioActions;

export function useRadioState(
  initialState: unstable_SealedInitialState<RadioInitialState> = {}
): RadioStateReturn {
  const {
    state: initialCurrentValue,
    loop: loop = true,
    ...sealed
  } = unstable_useSealedState(initialState);

  const [state, setState] = React.useState(initialCurrentValue);

  const rover = useRoverState({ ...sealed, loop });

  return {
    ...rover,
    state,
    setState
  };
}

const keys: Array<keyof RadioStateReturn> = [
  ...useRoverState.__keys,
  "state",
  "setState"
];

useRadioState.__keys = keys;
