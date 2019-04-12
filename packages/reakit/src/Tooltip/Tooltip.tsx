import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useCreateElement } from "../utils/useCreateElement";
import { unstable_useOptions } from "../system/useOptions";
import { unstable_useProps } from "../system/useProps";
import { Portal } from "../Portal/Portal";
import { HiddenOptions, HiddenProps, useHidden } from "../Hidden/Hidden";
import { Keys } from "../__utils/types";
import { TooltipStateReturn, useTooltipState } from "./TooltipState";

export type TooltipOptions = HiddenOptions &
  Pick<
    Partial<TooltipStateReturn>,
    "unstable_popoverRef" | "unstable_popoverStyles"
  >;

export type TooltipProps = HiddenProps;

export function useTooltip(
  options: TooltipOptions = {},
  htmlProps: TooltipProps = {}
) {
  options = unstable_useOptions("useTooltip", options, htmlProps);
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
  htmlProps = unstable_useProps("useTooltip", options, htmlProps);
  return htmlProps;
}

const keys: Keys<TooltipStateReturn & TooltipOptions> = [
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
