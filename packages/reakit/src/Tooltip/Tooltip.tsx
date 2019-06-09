import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { mergeRefs } from "reakit-utils/mergeRefs";
import { usePipe } from "reakit-utils/usePipe";
import { HiddenOptions, HiddenHTMLProps, useHidden } from "../Hidden/Hidden";
import { Portal } from "../Portal/Portal";
import { TooltipStateReturn, useTooltipState } from "./TooltipState";

export type TooltipOptions = HiddenOptions &
  Pick<
    Partial<TooltipStateReturn>,
    "unstable_popoverRef" | "unstable_popoverStyles"
  >;

export type TooltipHTMLProps = HiddenHTMLProps;

export type TooltipProps = TooltipOptions & TooltipHTMLProps;

export const useTooltip = createHook<TooltipOptions, TooltipHTMLProps>({
  name: "Tooltip",
  compose: useHidden,
  useState: useTooltipState,

  useProps(
    options,
    { ref: htmlRef, style: htmlStyle, unstable_wrap: htmlWrap, ...htmlProps }
  ) {
    const wrap = React.useCallback(
      (children: React.ReactNode) => <Portal>{children}</Portal>,
      []
    );
    return {
      ref: mergeRefs(options.unstable_popoverRef, htmlRef),
      role: "tooltip",
      style: {
        ...options.unstable_popoverStyles,
        pointerEvents: "none",
        ...htmlStyle
      },
      unstable_wrap: usePipe(wrap, htmlWrap),
      ...htmlProps
    };
  }
});

export const Tooltip = createComponent({
  as: "div",
  useHook: useTooltip
});
