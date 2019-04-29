import { unstable_createComponent } from "../utils/createComponent";
import {
  PopoverArrowOptions,
  PopoverArrowProps,
  usePopoverArrow
} from "../Popover/PopoverArrow";
import { unstable_createHook } from "../utils/createHook";
import { useTooltipState } from "./TooltipState";

export type TooltipArrowOptions = PopoverArrowOptions;

export type TooltipArrowProps = PopoverArrowProps;

export const useTooltipArrow = unstable_createHook<
  TooltipArrowOptions,
  TooltipArrowProps
>({
  name: "TooltipArrow",
  compose: usePopoverArrow,
  useState: useTooltipState
});

export const TooltipArrow = unstable_createComponent({
  as: "div",
  useHook: useTooltipArrow
});
