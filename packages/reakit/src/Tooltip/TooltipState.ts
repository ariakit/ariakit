import {
  unstable_PopoverState,
  unstable_PopoverActions,
  unstable_PopoverStateOptions,
  usePopoverState
} from "../Popover/PopoverState";

export type unstable_TooltipState = unstable_PopoverState;

export type unstable_TooltipActions = unstable_PopoverActions;

export type unstable_TooltipStateOptions = unstable_PopoverStateOptions;

export type unstable_TooltipStateReturn = unstable_TooltipState &
  unstable_TooltipActions;

export function useTooltipState({
  placement = "top",
  ...options
}: unstable_TooltipStateOptions = {}): unstable_TooltipStateReturn {
  return usePopoverState({ placement, ...options });
}

const keys: Array<keyof unstable_TooltipStateReturn> = [
  ...usePopoverState.keys
];

useTooltipState.keys = keys;
