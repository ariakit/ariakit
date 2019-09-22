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
  > & {
    /**
     * Whether or not the dialog should be rendered within `Portal`.
     * It's `true` by default if `modal` is `true`.
     */
    unstable_portal?: boolean;
  };

export type TooltipHTMLProps = HiddenHTMLProps;

export type TooltipProps = TooltipOptions & TooltipHTMLProps;

export const useTooltip = createHook<TooltipOptions, TooltipHTMLProps>({
  name: "Tooltip",
  compose: useHidden,
  useState: useTooltipState,
  keys: ["unstable_portal"],

  useOptions({ unstable_portal = true, ...options }) {
    return {
      unstable_portal,
      ...options
    };
  },

  useProps(
    options,
    { ref: htmlRef, style: htmlStyle, unstable_wrap: htmlWrap, ...htmlProps }
  ) {
    const wrap = React.useCallback(
      (children: React.ReactNode) => {
        if (options.unstable_portal) {
          return <Portal>{children}</Portal>;
        }
        return children;
      },
      [options.unstable_portal]
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
