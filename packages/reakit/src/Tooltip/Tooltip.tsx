import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useForkRef } from "reakit-utils/useForkRef";
import { usePipe } from "reakit-utils/usePipe";
import {
  DisclosureContentOptions,
  DisclosureContentHTMLProps,
  useDisclosureContent
} from "../Disclosure/DisclosureContent";
import { Portal } from "../Portal/Portal";
import { TooltipStateReturn, useTooltipState } from "./TooltipState";

export type TooltipOptions = DisclosureContentOptions &
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

export type TooltipHTMLProps = DisclosureContentHTMLProps;

export type TooltipProps = TooltipOptions & TooltipHTMLProps;

export const useTooltip = createHook<TooltipOptions, TooltipHTMLProps>({
  name: "Tooltip",
  compose: useDisclosureContent,
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
    {
      ref: htmlRef,
      style: htmlStyle,
      wrapElement: htmlWrapElement,
      ...htmlProps
    }
  ) {
    const wrapElement = React.useCallback(
      (element: React.ReactNode) => {
        if (options.unstable_portal) {
          return <Portal>{element}</Portal>;
        }
        return element;
      },
      [options.unstable_portal]
    );

    return {
      ref: useForkRef(options.unstable_popoverRef, htmlRef),
      role: "tooltip",
      style: {
        ...options.unstable_popoverStyles,
        pointerEvents: "none",
        ...htmlStyle
      },
      wrapElement: usePipe(wrapElement, htmlWrapElement),
      ...htmlProps
    };
  }
});

export const Tooltip = createComponent({
  as: "div",
  useHook: useTooltip
});
