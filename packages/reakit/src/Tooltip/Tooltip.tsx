import * as React from "react";
import { mergeProps } from "../utils/mergeProps";
import { unstable_createComponent } from "../utils/createComponent";
import { Portal } from "../Portal/Portal";
import { HiddenOptions, HiddenProps, useHidden } from "../Hidden/Hidden";
import { unstable_createHook } from "../utils/createHook";
import { TooltipStateReturn, useTooltipState } from "./TooltipState";

export type TooltipOptions = HiddenOptions &
  Pick<
    Partial<TooltipStateReturn>,
    "unstable_popoverRef" | "unstable_popoverStyles"
  >;

export type TooltipProps = HiddenProps;

export const useTooltip = unstable_createHook<TooltipOptions, TooltipProps>({
  name: "Tooltip",
  compose: useHidden,
  useState: useTooltipState,

  useProps(options, htmlProps) {
    const wrap = React.useCallback(
      (children: React.ReactNode) => <Portal>{children}</Portal>,
      []
    );
    return mergeProps(
      {
        role: "tooltip",
        ref: options.unstable_popoverRef,
        style: {
          ...options.unstable_popoverStyles,
          pointerEvents: "none",
          zIndex: 999
        },
        unstable_wrap: wrap
      } as TooltipProps,
      htmlProps
    );
  }
});

export const Tooltip = unstable_createComponent({
  as: "div",
  useHook: useTooltip
});
