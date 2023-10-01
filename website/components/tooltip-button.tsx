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
  useTooltipStore,
} from "@ariakit/react/tooltip";
import { createComponent } from "@ariakit/react-core/utils/system";

export interface TooltipButtonOptions<T extends ElementType = "button">
  extends TooltipAnchorOptions<T> {
  title: ReactNode;
  tooltipProps?: TooltipProps;
  fixed?: boolean;
  isLabel?: boolean;
}

export const TooltipButton = createComponent<TooltipButtonOptions>(
  ({ title, tooltipProps, fixed, isLabel, store, ...props }) => {
    const tooltip = useTooltipStore({
      store,
      type: isLabel ? "label" : "description",
    });
    const mounted = tooltip.useState("mounted");
    return (
      <>
        <Role.button
          {...props}
          render={
            <TooltipAnchor
              store={tooltip}
              render={<Button render={props.render} />}
            />
          }
        />
        {mounted && (
          <Tooltip
            {...tooltipProps}
            fixed
            store={tooltip}
            className={cx(
              "z-40 cursor-default rounded-md px-2 py-1 text-sm",
              "drop-shadow-sm dark:drop-shadow-sm-dark",
              "bg-gray-150 dark:bg-gray-700",
              "text-black dark:text-white",
              "border border-gray-300 dark:border-gray-600",
              tooltipProps?.className,
            )}
          >
            {title}
          </Tooltip>
        )}
      </>
    );
  },
);
