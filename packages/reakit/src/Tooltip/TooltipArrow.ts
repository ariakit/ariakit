import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import {
  PopoverArrowOptions,
  PopoverArrowProps,
  usePopoverArrow
} from "../Popover/PopoverArrow";
import { Keys } from "../__utils/types";
import { useTooltipState, TooltipStateReturn } from "./TooltipState";

export type TooltipArrowOptions = PopoverArrowOptions;

export type TooltipArrowProps = PopoverArrowProps;

export function useTooltipArrow(
  options: TooltipArrowOptions,
  htmlProps: TooltipArrowProps = {}
) {
  options = unstable_useOptions("useTooltipArrow", options, htmlProps);
  htmlProps = usePopoverArrow(options, htmlProps);
  htmlProps = unstable_useProps("useTooltipArrow", options, htmlProps);
  return htmlProps;
}

const keys: Keys<TooltipStateReturn & TooltipArrowOptions> = [
  ...usePopoverArrow.__keys,
  ...useTooltipState.__keys
];

useTooltipArrow.__keys = keys;

export const TooltipArrow = unstable_createComponent({
  as: "div",
  useHook: useTooltipArrow
});
