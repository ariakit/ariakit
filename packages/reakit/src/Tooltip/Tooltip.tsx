import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { useHook } from "../system/useHook";
import { Portal } from "../Portal/Portal";
import {
  unstable_HiddenOptions,
  unstable_HiddenProps,
  useHidden
} from "../Hidden/Hidden";
import { Keys } from "../__utils/types";
import { unstable_TooltipStateReturn, useTooltipState } from "./TooltipState";

export type unstable_TooltipOptions = unstable_HiddenOptions &
  Partial<unstable_TooltipStateReturn>;

export type unstable_TooltipProps = unstable_HiddenProps;

export function useTooltip(
  options: unstable_TooltipOptions = {},
  htmlProps: unstable_TooltipProps = {}
) {
  htmlProps = mergeProps(
    {
      role: "tooltip",
      ref: options.unstable_popoverRef,
      style: {
        ...options.unstable_popoverStyles,
        pointerEvents: "none"
      }
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = useHidden(options, htmlProps);
  htmlProps = useHook("useTooltip", options, htmlProps);
  return htmlProps;
}

const keys: Keys<unstable_TooltipOptions> = [
  ...useHidden.__keys,
  ...useTooltipState.__keys
];

useTooltip.__keys = keys;

export const Tooltip = unstable_createComponent({
  as: "div",
  useHook: useTooltip,
  useCreateElement: (type, props, children) => {
    const element = unstable_useCreateElement(type, props, children);
    return <Portal>{element}</Portal>;
  }
});
