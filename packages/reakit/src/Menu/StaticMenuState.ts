import { SealedInitialState, useSealedState } from "../__utils/useSealedState";
import {
  unstable_RoverState,
  unstable_RoverActions,
  unstable_RoverInitialState,
  useRoverState
} from "../Rover/RoverState";

export type unstable_StaticMenuState = unstable_RoverState;

export type unstable_StaticMenuActions = unstable_RoverActions;

export type unstable_StaticMenuInitialState = unstable_RoverInitialState;

export type unstable_StaticMenuStateReturn = unstable_StaticMenuState &
  unstable_StaticMenuActions;

export function useStaticMenuState(
  initialState: SealedInitialState<unstable_StaticMenuInitialState> = {}
): unstable_StaticMenuStateReturn {
  const { orientation = "vertical", ...sealed } = useSealedState(initialState);
  return useRoverState({ ...sealed, orientation });
}

const keys: Array<keyof unstable_StaticMenuStateReturn> = [
  ...useRoverState.keys
];

useStaticMenuState.keys = keys;
