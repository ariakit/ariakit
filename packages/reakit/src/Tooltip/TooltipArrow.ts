import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
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
  options = unstable_useOptions("useTooltipArrow", options, htmlProps);
  htmlProps = usePopoverArrow(options, htmlProps);
  htmlProps = unstable_useProps("useTooltipArrow", options, htmlProps);
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
