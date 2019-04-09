import { useSealedState, SealedInitialState } from "../__utils/useSealedState";
import {
  PopoverState,
  PopoverActions,
  PopoverInitialState,
  usePopoverState
} from "../Popover/PopoverState";
import { Keys } from "../__utils/types";

export type TooltipState = PopoverState;

export type TooltipActions = PopoverActions;

export type TooltipInitialState = PopoverInitialState;

export type TooltipStateReturn = TooltipState & TooltipActions;

export function useTooltipState(
  initialState: SealedInitialState<TooltipInitialState> = {}
): TooltipStateReturn {
  const { placement = "top", ...sealed } = useSealedState(initialState);
  return usePopoverState({ ...sealed, placement });
}

const keys: Keys<TooltipStateReturn> = [...usePopoverState.__keys];

useTooltipState.__keys = keys;
