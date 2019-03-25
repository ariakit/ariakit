import { unstable_createComponent } from "../utils/createComponent";
import { useHook } from "../system/useHook";
import {
  unstable_PopoverArrowOptions,
  unstable_PopoverArrowProps,
  usePopoverArrow
} from "../Popover/PopoverArrow";
import { Keys } from "../__utils/types";
import { useTooltipState, unstable_TooltipStateReturn } from "./TooltipState";

export type unstable_TooltipArrowOptions = unstable_PopoverArrowOptions &
  Partial<unstable_TooltipStateReturn>;

export type unstable_TooltipArrowProps = unstable_PopoverArrowProps;

export function useTooltipArrow(
  options: unstable_TooltipArrowOptions,
  htmlProps: unstable_TooltipArrowProps = {}
) {
  htmlProps = usePopoverArrow(options, htmlProps);
  htmlProps = useHook("useTooltipArrow", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_TooltipArrowOptions> = [
  ...usePopoverArrow.__keys,
  ...useTooltipState.__keys
];

useTooltipArrow.__keys = keys;

export const TooltipArrow = unstable_createComponent({
  as: "div",
  useHook: useTooltipArrow
});
