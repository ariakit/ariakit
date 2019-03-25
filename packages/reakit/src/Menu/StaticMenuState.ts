import { SealedInitialState, useSealedState } from "../__utils/useSealedState";
import {
  unstable_RoverState,
  unstable_RoverActions,
  unstable_RoverInitialState,
  useRoverState
} from "../Rover/RoverState";
import { Keys } from "../__utils/types";

export type unstable_StaticMenuState = unstable_RoverState;

export type unstable_StaticMenuActions = unstable_RoverActions;

export type unstable_StaticMenuInitialState = unstable_RoverInitialState;

export type unstable_StaticMenuStateReturn = unstable_StaticMenuState &
  unstable_StaticMenuActions;

export function unstable_useStaticMenuState(
  initialState: SealedInitialState<unstable_StaticMenuInitialState> = {}
): unstable_StaticMenuStateReturn {
  const { orientation = "vertical", ...sealed } = useSealedState(initialState);
  return useRoverState({
    unstable_loop: orientation === "horizontal",
    ...sealed,
    orientation
  });
}

const keys: Keys<unstable_StaticMenuStateReturn> = [...useRoverState.__keys];

unstable_useStaticMenuState.__keys = keys;
