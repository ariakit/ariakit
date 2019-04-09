import { SealedInitialState } from "../__utils/useSealedState";
import {
  useHiddenState,
  HiddenState,
  HiddenActions,
  HiddenInitialState
} from "../Hidden/HiddenState";
import { Keys } from "../__utils/types";

export type DialogState = HiddenState;

export type DialogActions = HiddenActions;

export type DialogInitialState = HiddenInitialState;

export type DialogStateReturn = DialogState & DialogActions;

export function useDialogState(
  initialState: SealedInitialState<DialogInitialState> = {}
): DialogStateReturn {
  return useHiddenState(initialState);
}

const keys: Keys<DialogStateReturn> = [...useHiddenState.__keys];

useDialogState.__keys = keys;
