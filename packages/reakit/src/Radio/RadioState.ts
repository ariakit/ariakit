import * as React from "react";
import { useSealedState, SealedInitialState } from "../__utils/useSealedState";
import {
  unstable_RoverState,
  unstable_RoverActions,
  unstable_RoverInitialState,
  useRoverState
} from "../Rover";
import { Keys } from "../__utils/types";

export type unstable_RadioState = unstable_RoverState & {
  /**
   * The `value` attribute of the current checked radio.
   */
  currentValue: any;
};

export type unstable_RadioActions = unstable_RoverActions & {
  /**
   * Changes the `currentValue` state.
   */
  setValue: React.Dispatch<React.SetStateAction<any>>;
};

export type unstable_RadioInitialState = unstable_RoverInitialState &
  Partial<Pick<unstable_RadioState, "currentValue">>;

export type unstable_RadioStateReturn = unstable_RadioState &
  unstable_RadioActions;

export function unstable_useRadioState(
  initialState: SealedInitialState<unstable_RadioInitialState> = {}
): unstable_RadioStateReturn {
  const {
    currentValue: initialCurrentValue,
    unstable_loop: loop = true,
    ...sealed
  } = useSealedState(initialState);

  const [currentValue, setValue] = React.useState(initialCurrentValue);

  const rover = useRoverState({ ...sealed, unstable_loop: loop });

  return {
    ...rover,
    currentValue,
    setValue
  };
}

const keys: Keys<unstable_RadioStateReturn> = [
  ...useRoverState.__keys,
  "currentValue",
  "setValue"
];

unstable_useRadioState.__keys = keys;
