import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { Portal } from "../Portal/Portal";
import { HiddenOptions, HiddenHTMLProps, useHidden } from "../Hidden/Hidden";
import { unstable_createHook } from "../utils/createHook";
import { mergeRefs } from "../__utils/mergeRefs";
import { usePipe } from "../__utils/usePipe";
import { TooltipStateReturn, useTooltipState } from "./TooltipState";

export type TooltipOptions = HiddenOptions &
  Pick<
    Partial<TooltipStateReturn>,
    "unstable_popoverRef" | "unstable_popoverStyles"
  >;

export type TooltipHTMLProps = HiddenHTMLProps;

export type TooltipProps = TooltipOptions & TooltipHTMLProps;

export const useTooltip = unstable_createHook<TooltipOptions, TooltipHTMLProps>(
  {
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
          zIndex: 999,
          ...htmlStyle
        },
        unstable_wrap: usePipe(wrap, htmlWrap),
        ...htmlProps
      };
    }
  }
);

export const Tooltip = unstable_createComponent({
  as: "div",
  useHook: useTooltip
});
