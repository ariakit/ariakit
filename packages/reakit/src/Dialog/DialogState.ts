import {
  useHiddenState,
  unstable_HiddenState,
  unstable_HiddenActions,
  unstable_HiddenStateOptions
} from "../Hidden/HiddenState";

export type unstable_DialogState = unstable_HiddenState;

export type unstable_DialogActions = unstable_HiddenActions;

export type unstable_DialogStateOptions = unstable_HiddenStateOptions;

export type unstable_DialogStateReturn = unstable_DialogState &
  unstable_DialogActions;

// TODO: Accept function for the entire options or for each value
export function useDialogState(
  options: unstable_DialogStateOptions = {}
): unstable_DialogStateReturn {
  return useHiddenState(options);
}

const keys: Array<keyof unstable_DialogStateReturn> = [...useHiddenState.keys];

useDialogState.keys = keys;
