import {
  unstable_DialogState,
  unstable_DialogActions,
  unstable_DialogStateOptions,
  useDialogState
} from "../dialog/useDialogState";

export type unstable_PopoverState = unstable_DialogState;

export type unstable_PopoverActions = unstable_DialogActions;

export type unstable_PopoverStateOptions = unstable_DialogStateOptions;

export type unstable_PopoverStateReturn = unstable_PopoverState &
  unstable_PopoverActions;

export function usePopoverState(
  options: unstable_PopoverStateOptions
): unstable_PopoverStateReturn {
  return useDialogState(options);
}

const keys: Array<keyof unstable_PopoverStateReturn> = [...useDialogState.keys];

usePopoverState.keys = keys;
