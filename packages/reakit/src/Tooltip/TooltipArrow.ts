import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
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
  useState: useTooltipState,

  useOptions({ size = 16, ...options }) {
    return { size, ...options };
  }
});

export const TooltipArrow = createComponent({
  as: "div",
  useHook: useTooltipArrow
});
