import { ElementType, forwardRef } from "react";
import { cx } from "ariakit-utils/misc";
import {
  Tooltip,
  TooltipAnchor,
  TooltipAnchorProps,
  TooltipProps,
  useTooltipState,
} from "ariakit/tooltip";

type TooltipControlProps = Omit<TooltipAnchorProps<ElementType>, "state"> & {
  title: string;
  tooltipProps?: Omit<TooltipProps, "state">;
};

export const TooltipControl = forwardRef<HTMLDivElement, TooltipControlProps>(
  ({ title, tooltipProps, ...props }, ref) => {
    const tooltip = useTooltipState({ timeout: 750 });
    return (
      <>
        <TooltipAnchor {...props} state={tooltip} ref={ref} />
        <Tooltip
          {...tooltipProps}
          className={cx(
            "bg-canvas-1 dark:bg-canvas-4 text-canvas-1 dark:text-canvas-4",
            "border border-canvas-1 dark:border-canvas-4 rounded-md",
            "py-1 px-2 text-sm filter drop-shadow-md",
            tooltipProps?.className
          )}
          state={tooltip}
        >
          {title}
        </Tooltip>
      </>
    );
  }
);
