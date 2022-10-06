import { ElementType, ReactNode } from "react";
import { createComponent } from "ariakit-react-utils/system";
import { cx } from "ariakit-utils/misc";
import { Button } from "ariakit/button";
import {
  Tooltip,
  TooltipAnchor,
  TooltipAnchorOptions,
  TooltipProps,
  useTooltipState,
} from "ariakit/tooltip";

export type TooltipButtonOptions<T extends ElementType = "button"> = Omit<
  TooltipAnchorOptions<T>,
  "state"
> & {
  title: ReactNode;
  tooltipProps?: Omit<TooltipProps, "state">;
};

const TooltipButton = createComponent<TooltipButtonOptions>(
  ({ title, tooltipProps, ...props }) => {
    const tooltip = useTooltipState({ timeout: 750 });
    return (
      <>
        <TooltipAnchor as={Button} {...props} state={tooltip} />
        {tooltip.mounted && (
          <Tooltip
            {...tooltipProps}
            state={tooltip}
            className={cx(
              "z-40 rounded-md py-1 px-2 text-sm",
              "drop-shadow-sm dark:drop-shadow-sm-dark",
              "bg-canvas-1 dark:bg-canvas-4-dark",
              "text-canvas-1 dark:text-canvas-4-dark",
              "border border-canvas-1 dark:border-canvas-4-dark",
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

export default TooltipButton;
