import { unstable_createComponent } from "../utils/createComponent";
import {
  PopoverArrowOptions,
  PopoverArrowHTMLProps,
  usePopoverArrow
} from "../Popover/PopoverArrow";
import { unstable_createHook } from "../utils/createHook";
import { useTooltipState } from "./TooltipState";

export type TooltipArrowOptions = PopoverArrowOptions;

export type TooltipArrowHTMLProps = PopoverArrowHTMLProps;

export type TooltipArrowProps = TooltipArrowOptions & TooltipArrowHTMLProps;

export const useTooltipArrow = unstable_createHook<
  TooltipArrowOptions,
  TooltipArrowHTMLProps
>({
  name: "TooltipArrow",
  compose: usePopoverArrow,
  useState: useTooltipState
});

export const TooltipArrow = unstable_createComponent({
  as: "div",
  useHook: useTooltipArrow
});
