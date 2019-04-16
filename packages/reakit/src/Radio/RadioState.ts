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
import { Keys } from "../__utils/types";

export type RadioState = RoverState & {
  /**
   * The `value` attribute of the current checked radio.
   */
  currentValue: any;
};

export type RadioActions = RoverActions & {
  /**
   * Changes the `currentValue` state.
   */
  setValue: React.Dispatch<React.SetStateAction<any>>;
};

export type RadioInitialState = RoverInitialState &
  Partial<Pick<RadioState, "currentValue">>;

export type RadioStateReturn = RadioState & RadioActions;

export function useRadioState(
  initialState: unstable_SealedInitialState<RadioInitialState> = {}
): RadioStateReturn {
  const {
    currentValue: initialCurrentValue,
    loop: loop = true,
    ...sealed
  } = unstable_useSealedState(initialState);

  const [currentValue, setValue] = React.useState(initialCurrentValue);

  const rover = useRoverState({ ...sealed, loop });

  return {
    ...rover,
    currentValue,
    setValue
  };
}

const keys: Keys<RadioStateReturn> = [
  ...useRoverState.__keys,
  "currentValue",
  "setValue"
];

useRadioState.__keys = keys;
