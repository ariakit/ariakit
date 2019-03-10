import {
  useRovingState,
  unstable_RovingState,
  unstable_RovingSelectors,
  unstable_RovingActions,
  unstable_RovingInitialState
} from "../Roving/RovingState";

export type unstable_ToolbarState = unstable_RovingState;

export type unstable_ToolbarSelectors = unstable_RovingSelectors;

export type unstable_ToolbarActions = unstable_RovingActions;

export type unstable_ToolbarInitialState = unstable_RovingInitialState;

export type unstable_ToolbarStateReturn = unstable_ToolbarState &
  unstable_ToolbarSelectors &
  unstable_ToolbarActions;

// TODO: Accept function for the entire options or for each value
export function useToolbarState(
  initialState: unstable_ToolbarInitialState = {}
): unstable_ToolbarStateReturn {
  return useRovingState(initialState);
}

const keys: Array<keyof unstable_ToolbarStateReturn> = [...useRovingState.keys];

useToolbarState.keys = keys;
