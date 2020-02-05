import {
  useSealedState,
  SealedInitialState
} from "reakit-utils/useSealedState";
import {
  PopoverState,
  PopoverActions,
  PopoverInitialState,
  usePopoverState,
  PopoverStateReturn
} from "../Popover/PopoverState";

export type TooltipState = Omit<PopoverState, "modal">;

export type TooltipActions = Omit<PopoverActions, "setModal">;

export type TooltipInitialState = Omit<PopoverInitialState, "modal">;

export type TooltipStateReturn = Omit<
  PopoverStateReturn,
  "modal" | "setModal"
> &
  TooltipState &
  TooltipActions;

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

const keys: Array<keyof PopoverStateReturn | keyof TooltipStateReturn> = [
  ...usePopoverState.__keys
];

useTooltipState.__keys = keys;
