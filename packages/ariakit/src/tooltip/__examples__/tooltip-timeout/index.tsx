import { Button } from "ariakit/button";
import { Tooltip, TooltipAnchor, useTooltipState } from "ariakit/tooltip";
import "./style.css";

export default function Example() {
  const tooltip = useTooltipState({ timeout: 2000 });
  return (
    <>
      <TooltipAnchor state={tooltip} as={Button} className="button">
        Hover or focus on me and wait for 2 seconds
      </TooltipAnchor>
      <Tooltip state={tooltip} className="tooltip">
        Tooltip
      </Tooltip>
    </>
  );
}
