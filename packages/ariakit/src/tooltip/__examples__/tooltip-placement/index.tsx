import { Button } from "ariakit/button";
import { Tooltip, TooltipAnchor, useTooltipStore } from "ariakit/tooltip/store";
import "./style.css";

export default function Example() {
  const tooltip = useTooltipStore({ placement: "bottom-end" });
  return (
    <>
      <TooltipAnchor store={tooltip} as={Button} className="button">
        Hover or focus on me
      </TooltipAnchor>
      <Tooltip store={tooltip} className="tooltip">
        Tooltip
      </Tooltip>
    </>
  );
}
