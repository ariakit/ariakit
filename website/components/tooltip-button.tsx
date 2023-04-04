"use client";

import type { ElementType, ReactNode } from "react";
import { cx } from "@ariakit/core/utils/misc";
import { Button } from "@ariakit/react/button";
import type {
  TooltipAnchorOptions,
  TooltipProps,
} from "@ariakit/react/tooltip";
import {
  Tooltip,
  TooltipAnchor,
  useTooltipStore,
} from "@ariakit/react/tooltip";
import { createComponent } from "@ariakit/react-core/utils/system";

export interface TooltipButtonOptions<T extends ElementType = "button">
  extends Omit<TooltipAnchorOptions<T>, "store"> {
  title: ReactNode;
  tooltipProps?: Omit<TooltipProps, "store">;
  fixed?: boolean;
}

export const TooltipButton = createComponent<TooltipButtonOptions>(
  ({ title, tooltipProps, fixed, ...props }) => {
    const tooltip = useTooltipStore({ timeout: 500, fixed });
    const mounted = tooltip.useState("mounted");
    return (
      <>
        <TooltipAnchor as={Button} {...props} store={tooltip} />
        {mounted && (
          <Tooltip
            {...tooltipProps}
            store={tooltip}
            className={cx(
              "z-40 rounded-md py-1 px-2 text-sm",
              "drop-shadow-sm dark:drop-shadow-sm-dark",
              "bg-gray-150 dark:bg-gray-700",
              "text-black dark:text-white",
              "border border-gray-300 dark:border-gray-600",
              tooltipProps?.className
            )}
          >
            {title}
          </Tooltip>
        )}
      </>
    );
  }
);
