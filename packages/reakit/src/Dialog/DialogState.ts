import { SealedInitialState } from "../__utils/useSealedState";
import {
  useHiddenState,
  unstable_HiddenState,
  unstable_HiddenActions,
  unstable_HiddenInitialState
} from "../Hidden/HiddenState";
import { Keys } from "../__utils/types";

export type unstable_DialogState = unstable_HiddenState;

export type unstable_DialogActions = unstable_HiddenActions;

export type unstable_DialogInitialState = unstable_HiddenInitialState;

export type unstable_DialogStateReturn = unstable_DialogState &
  unstable_DialogActions;

export function useDialogState(
  initialState: SealedInitialState<unstable_DialogInitialState> = {}
): unstable_DialogStateReturn {
  return useHiddenState(initialState);
}

const keys: Keys<unstable_DialogStateReturn> = [...useHiddenState.__keys];

useDialogState.__keys = keys;
