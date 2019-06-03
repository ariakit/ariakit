import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import {
  useRoverState,
  RoverState,
  RoverActions,
  RoverInitialState
} from "../Rover/RoverState";

export type ToolbarState = RoverState;

export type ToolbarActions = RoverActions;

export type ToolbarInitialState = RoverInitialState;

export type ToolbarStateReturn = ToolbarState & ToolbarActions;

export function useToolbarState(
  initialState: SealedInitialState<ToolbarInitialState> = {}
): ToolbarStateReturn {
  const { orientation = "horizontal", ...sealed } = useSealedState(
    initialState
  );
  return useRoverState({ orientation, ...sealed });
}

const keys: Array<keyof ToolbarStateReturn> = [...useRoverState.__keys];

useToolbarState.__keys = keys;
