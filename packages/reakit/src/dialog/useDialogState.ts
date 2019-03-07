import {
  useHiddenState,
  unstable_HiddenState,
  unstable_HiddenActions,
  unstable_HiddenStateOptions
} from "../hidden/useHiddenState";

export type unstable_DialogState = unstable_HiddenState & {
  /** TODO: Description */
  modal: boolean;
};

export type unstable_DialogActions = unstable_HiddenActions;

export type unstable_DialogStateOptions = unstable_HiddenStateOptions &
  Partial<Pick<unstable_DialogState, "modal">>;

// TODO: Accept function for the entire options or for each value
export function useDialogState({
  modal = false,
  ...options
}: unstable_DialogStateOptions = {}): unstable_DialogState &
  unstable_DialogActions {
  return {
    modal,
    ...useHiddenState(options)
  };
}

const keys: Array<keyof ReturnType<typeof useDialogState>> = [
  "modal",
  ...useHiddenState.keys
];

useDialogState.keys = keys;
