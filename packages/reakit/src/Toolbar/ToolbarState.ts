import { SealedInitialState, useSealedState } from "../__utils/useSealedState";
import {
  useRoverState,
  unstable_RoverState,
  unstable_RoverActions,
  unstable_RoverInitialState
} from "../Rover/RoverState";
import { Keys } from "../__utils/types";

export type unstable_ToolbarState = unstable_RoverState;

export type unstable_ToolbarActions = unstable_RoverActions;

export type unstable_ToolbarInitialState = unstable_RoverInitialState;

export type unstable_ToolbarStateReturn = unstable_ToolbarState &
  unstable_ToolbarActions;

export function useToolbarState(
  initialState: SealedInitialState<unstable_ToolbarInitialState> = {}
): unstable_ToolbarStateReturn {
  const { orientation = "horizontal", ...sealed } = useSealedState(
    initialState
  );
  return useRoverState({ orientation, ...sealed });
}

const keys: Keys<unstable_ToolbarStateReturn> = [...useRoverState.__keys];

useToolbarState.__keys = keys;
