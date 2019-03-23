import * as React from "react";
import { useSealedState, SealedInitialState } from "../__utils/useSealedState";
import {
  unstable_RoverState,
  unstable_RoverActions,
  unstable_RoverInitialState,
  useRoverState
} from "../Rover";

export type unstable_RadioState = unstable_RoverState & {
  /** TODO: Description */
  currentValue: any;
};

export type unstable_RadioActions = unstable_RoverActions & {
  /** TODO: Description */
  setValue: React.Dispatch<React.SetStateAction<any>>;
};

export type unstable_RadioInitialState = unstable_RoverInitialState &
  Partial<Pick<unstable_RadioState, "currentValue">>;

export type unstable_RadioStateReturn = unstable_RadioState &
  unstable_RadioActions;

export function useRadioState(
  initialState: SealedInitialState<unstable_RadioInitialState> = {}
): unstable_RadioStateReturn {
  const {
    currentValue: initialCurrentValue,
    loop = true,
    ...sealed
  } = useSealedState(initialState);

  const [currentValue, setValue] = React.useState(initialCurrentValue);

  const rover = useRoverState({ ...sealed, loop });

  return {
    ...rover,
    currentValue,
    setValue
  };
}

const keys: Array<keyof unstable_RadioStateReturn> = [
  ...useRoverState.keys,
  "currentValue",
  "setValue"
];

useRadioState.keys = keys;
