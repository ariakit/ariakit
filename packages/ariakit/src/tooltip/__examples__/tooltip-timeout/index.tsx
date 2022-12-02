import { Button } from "ariakit/button";
import { Tooltip, TooltipAnchor, useTooltipStore } from "ariakit/tooltip/store";
import "./style.css";

export default function Example() {
  const tooltip = useTooltipStore({ timeout: 2000 });
  return (
    <>
      <TooltipAnchor store={tooltip} as={Button} className="button">
        Hover or focus on me and wait for 2 seconds
      </TooltipAnchor>
      <Tooltip store={tooltip} className="tooltip">
        Tooltip
      </Tooltip>
    </>
  );
}
