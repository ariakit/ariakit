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

export default TooltipButton;
