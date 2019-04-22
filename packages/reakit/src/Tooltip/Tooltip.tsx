import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
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
  options = unstable_useOptions("Tooltip", options, htmlProps);
  htmlProps = mergeProps(
    {
      role: "tooltip",
      ref: options.unstable_popoverRef,
      style: {
        ...options.unstable_popoverStyles,
        pointerEvents: "none"
      },
      unstable_wrap: children => <Portal>{children}</Portal>
    } as typeof htmlProps,
    htmlProps
  );
  htmlProps = unstable_useProps("Tooltip", options, htmlProps);
  htmlProps = useHidden(options, htmlProps);
  return htmlProps;
}

const keys: Keys<TooltipStateReturn & TooltipOptions> = [
  ...useHidden.__keys,
  ...useTooltipState.__keys
];

useTooltip.__keys = keys;

export const Tooltip = unstable_createComponent({
  as: "div",
  useHook: useTooltip
});
