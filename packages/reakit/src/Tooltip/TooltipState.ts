import {
  useSealedState,
  SealedInitialState
} from "reakit-utils/useSealedState";
import {
  PopoverState,
  PopoverActions,
  PopoverInitialState,
  usePopoverState
} from "../Popover/PopoverState";

export type TooltipState = PopoverState;

export type TooltipActions = PopoverActions;

export type TooltipInitialState = PopoverInitialState;

export type TooltipStateReturn = TooltipState & TooltipActions;

export function useTooltipState(
  initialState: SealedInitialState<TooltipInitialState> = {}
): TooltipStateReturn {
  const {
    placement = "top",
    unstable_boundariesElement = "window",
    ...sealed
  } = useSealedState(initialState);
  return usePopoverState({ ...sealed, placement, unstable_boundariesElement });
}

const keys: Array<keyof TooltipStateReturn> = [...usePopoverState.__keys];

useTooltipState.__keys = keys;
