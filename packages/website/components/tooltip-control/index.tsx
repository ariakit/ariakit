import { ElementType, forwardRef } from "react";
import { cx } from "ariakit-utils/misc";
import {
  Tooltip,
  TooltipAnchor,
  TooltipAnchorProps,
  TooltipProps,
  useTooltipState,
} from "ariakit/tooltip";

export type TooltipControlProps = Omit<
  TooltipAnchorProps<ElementType>,
  "state"
> & {
  title: string;
  tooltipProps?: Omit<TooltipProps, "state">;
};

const TooltipControl = forwardRef<HTMLButtonElement, TooltipControlProps>(
  ({ title, tooltipProps, ...props }, ref) => {
    const tooltip = useTooltipState({ timeout: 750 });
    return (
      <>
        <TooltipAnchor as="button" {...props} state={tooltip} ref={ref} />
        <Tooltip
          {...tooltipProps}
          className={cx(
            "bg-canvas-1 dark:bg-canvas-4-dark text-canvas-1",
            "dark:text-canvas-4-dark border border-canvas-1",
            "dark:border-canvas-4-dark rounded-md",
            "py-1 px-2 text-sm drop-shadow-sm dark:drop-shadow-sm-dark",
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

export default TooltipControl;
