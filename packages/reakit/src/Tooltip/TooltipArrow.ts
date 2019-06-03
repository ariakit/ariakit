import { createComponent } from "reakit-utils/createComponent";
import { createHook } from "reakit-utils/createHook";
import {
  PopoverArrowOptions,
  PopoverArrowHTMLProps,
  usePopoverArrow
} from "../Popover/PopoverArrow";
import { useTooltipState } from "./TooltipState";

export type TooltipArrowOptions = PopoverArrowOptions;

export type TooltipArrowHTMLProps = PopoverArrowHTMLProps;

export type TooltipArrowProps = TooltipArrowOptions & TooltipArrowHTMLProps;

export const useTooltipArrow = createHook<
  TooltipArrowOptions,
  TooltipArrowHTMLProps
>({
  name: "TooltipArrow",
  compose: usePopoverArrow,
  useState: useTooltipState
});

export const TooltipArrow = createComponent({
  as: "div",
  useHook: useTooltipArrow
});
