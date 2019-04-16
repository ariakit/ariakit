import {
  unstable_SealedInitialState,
  unstable_useSealedState
} from "../utils/useSealedState";
import {
  useRoverState,
  RoverState,
  RoverActions,
  RoverInitialState
} from "../Rover/RoverState";
import { Keys } from "../__utils/types";

export type ToolbarState = RoverState;

export type ToolbarActions = RoverActions;

export type ToolbarInitialState = RoverInitialState;

export type ToolbarStateReturn = ToolbarState & ToolbarActions;

export function useToolbarState(
  initialState: unstable_SealedInitialState<ToolbarInitialState> = {}
): ToolbarStateReturn {
  const { orientation = "horizontal", ...sealed } = unstable_useSealedState(
    initialState
  );
  return useRoverState({ orientation, ...sealed });
}

const keys: Keys<ToolbarStateReturn> = [...useRoverState.__keys];

useToolbarState.__keys = keys;
