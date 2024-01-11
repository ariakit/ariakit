"use client";

import type { ElementType, ReactNode } from "react";
import { cx } from "@ariakit/core/utils/misc";
import { Role } from "@ariakit/react";
import { Button } from "@ariakit/react/button";
import type {
  TooltipAnchorOptions,
  TooltipProps,
} from "@ariakit/react/tooltip";
import {
  Tooltip,
  TooltipAnchor,
  TooltipProvider,
} from "@ariakit/react/tooltip";
import { createComponent } from "@ariakit/react-core/utils/system";

export interface TooltipButtonOptions<T extends ElementType = "button">
  extends TooltipAnchorOptions<T> {
  title: ReactNode;
  tooltipProps?: TooltipProps;
  fixed?: boolean;
}

export const TooltipButton = createComponent<TooltipButtonOptions>(
  ({ title, tooltipProps, fixed, store, ...props }) => {
    return (
      <TooltipProvider store={store}>
        <Role.button
          {...props}
          render={<TooltipAnchor render={<Button render={props.render} />} />}
        />
        <Tooltip
          {...tooltipProps}
          fixed
          unmountOnHide
          className={cx(
            "z-50 cursor-default rounded-md px-2 py-1 text-sm",
            "drop-shadow-sm dark:drop-shadow-sm-dark",
            "bg-gray-150 dark:bg-gray-700",
            "text-black dark:text-white",
            "border border-gray-300 dark:border-gray-600",
            tooltipProps?.className,
          )}
        >
          {title}
        </Tooltip>
      </TooltipProvider>
    );
  },
);
