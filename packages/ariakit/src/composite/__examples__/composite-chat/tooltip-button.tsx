import { ElementType, forwardRef } from "react";
import { Button } from "ariakit/button";
import {
  Tooltip,
  TooltipAnchor,
  TooltipAnchorProps,
  TooltipProps,
  useTooltipState,
} from "ariakit/tooltip";

export type TooltipButtonProps = Omit<
  TooltipAnchorProps<ElementType>,
  "state"
> & {
  title: string;
  tooltipProps?: Omit<TooltipProps, "state">;
};

const TooltipButton = forwardRef<HTMLButtonElement, TooltipButtonProps>(
  ({ title, tooltipProps, ...props }, ref) => {
    const tooltip = useTooltipState({ timeout: 750 });
    return (
      <>
        <TooltipAnchor as={Button} {...props} ref={ref} state={tooltip} />
        <Tooltip className="tooltip" {...tooltipProps} state={tooltip}>
          {title}
        </Tooltip>
      </>
    );
  }
);

export default TooltipButton;
