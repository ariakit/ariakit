import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  unstable_PopoverArrowOptions,
  unstable_PopoverArrowProps,
  usePopoverArrow
} from "../Popover/PopoverArrow";
import { useTooltipState, unstable_TooltipStateReturn } from "./TooltipState";

export type unstable_TooltipArrowOptions = unstable_PopoverArrowOptions &
  Partial<unstable_TooltipStateReturn>;

export type unstable_TooltipArrowProps = unstable_PopoverArrowProps;

export function useTooltipArrow(
  options: unstable_TooltipArrowOptions,
  htmlProps: unstable_TooltipArrowProps = {}
) {
  htmlProps = usePopoverArrow(options, htmlProps);
  htmlProps = unstable_useHook("useTooltipArrow", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_TooltipArrowOptions> = [
  ...usePopoverArrow.keys,
  ...useTooltipState.keys
];

useTooltipArrow.keys = keys;

export const TooltipArrow = unstable_createComponent("div", useTooltipArrow);
