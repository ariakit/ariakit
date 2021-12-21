import { Button } from "ariakit/button";
import { Tooltip, TooltipAnchor, useTooltipState } from "ariakit/tooltip";
import "./style.css";

export default function Example() {
  const tooltip = useTooltipState({ placement: "bottom-end" });
  return (
    <>
      <TooltipAnchor state={tooltip} as={Button} className="button">
        Hover or focus on me
      </TooltipAnchor>
      <Tooltip state={tooltip} className="tooltip">
        Tooltip
      </Tooltip>
    </>
  );
}
