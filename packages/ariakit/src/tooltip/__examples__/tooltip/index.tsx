import { Button } from "ariakit/button";
import { Tooltip, TooltipAnchor, useTooltipStore } from "ariakit/tooltip/store";
import "./style.css";

export default function Example() {
  const tooltip = useTooltipStore();
  return (
    <>
      <TooltipAnchor store={tooltip} as={Button} className="button secondary">
        Hover or focus on me
      </TooltipAnchor>
      <Tooltip portal={false} store={tooltip} className="tooltip">
        Tooltip
      </Tooltip>
    </>
  );
}
