import * as React from "react";
import {
  useHiddenState,
  unstable_HiddenState,
  unstable_HiddenActions,
  unstable_HiddenStateOptions
} from "../hidden/useHiddenState";

export type unstable_DialogState = unstable_HiddenState & {
  /** TODO: Description */
  unstable_modal: boolean;
};

export type unstable_DialogActions = unstable_HiddenActions & {
  /** TODO: Description */
  unstable_setModal: (value: boolean) => void;
};

export type unstable_DialogStateOptions = unstable_HiddenStateOptions &
  Partial<Pick<unstable_DialogState, "unstable_modal">>;

// TODO: Accept function for the entire options or for each value
export function useDialogState({
  unstable_modal: initialModal = false,
  ...options
}: unstable_DialogStateOptions = {}): unstable_DialogState &
  unstable_DialogActions {
  const [modal, setModal] = React.useState(initialModal);
  return {
    ...useHiddenState(options),
    unstable_modal: modal,
    unstable_setModal: React.useCallback(setModal, [])
  };
}

const keys: Array<keyof ReturnType<typeof useDialogState>> = [
  ...useHiddenState.keys,
  "unstable_modal",
  "unstable_setModal"
];

useDialogState.keys = keys;
