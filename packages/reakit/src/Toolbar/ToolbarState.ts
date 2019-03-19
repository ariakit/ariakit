import { SealedInitialState } from "../__utils/useSealedState";
import {
  useRoverState,
  unstable_RoverState,
  unstable_RoverActions,
  unstable_RoverInitialState
} from "../Rover/RoverState";

export type unstable_ToolbarState = unstable_RoverState;

export type unstable_ToolbarActions = unstable_RoverActions;

export type unstable_ToolbarInitialState = unstable_RoverInitialState;

export type unstable_ToolbarStateReturn = unstable_ToolbarState &
  unstable_ToolbarActions;

export function useToolbarState(
  initialState: SealedInitialState<unstable_ToolbarInitialState> = {}
): unstable_ToolbarStateReturn {
  return useRoverState(initialState);
}

const keys: Array<keyof unstable_ToolbarStateReturn> = [...useRoverState.keys];

useToolbarState.keys = keys;
