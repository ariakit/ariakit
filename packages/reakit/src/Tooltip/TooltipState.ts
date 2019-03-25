import { useSealedState, SealedInitialState } from "../__utils/useSealedState";
import {
  unstable_PopoverState,
  unstable_PopoverActions,
  unstable_PopoverInitialState,
  usePopoverState
} from "../Popover/PopoverState";
import { Keys } from "../__utils/types";

export type unstable_TooltipState = unstable_PopoverState;

export type unstable_TooltipActions = unstable_PopoverActions;

export type unstable_TooltipInitialState = unstable_PopoverInitialState;

export type unstable_TooltipStateReturn = unstable_TooltipState &
  unstable_TooltipActions;

export function useTooltipState(
  initialState: SealedInitialState<unstable_TooltipInitialState> = {}
): unstable_TooltipStateReturn {
  const { placement = "top", ...sealed } = useSealedState(initialState);
  return usePopoverState({ ...sealed, placement });
}

const keys: Keys<unstable_TooltipStateReturn> = [...usePopoverState.__keys];

useTooltipState.__keys = keys;
