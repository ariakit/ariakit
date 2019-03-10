import {
  useHiddenState,
  unstable_HiddenState,
  unstable_HiddenActions,
  unstable_HiddenInitialState
} from "../Hidden/HiddenState";

export type unstable_DialogState = unstable_HiddenState;

export type unstable_DialogActions = unstable_HiddenActions;

export type unstable_DialogInitialState = unstable_HiddenInitialState;

export type unstable_DialogStateReturn = unstable_DialogState &
  unstable_DialogActions;

// TODO: Accept function for the entire options or for each value
export function useDialogState(
  initialState: unstable_DialogInitialState = {}
): unstable_DialogStateReturn {
  return useHiddenState(initialState);
}

const keys: Array<keyof unstable_DialogStateReturn> = [...useHiddenState.keys];

useDialogState.keys = keys;
