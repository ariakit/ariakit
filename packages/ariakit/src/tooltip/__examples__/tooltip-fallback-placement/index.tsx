import { Button } from "ariakit/button";
import { Tooltip, TooltipAnchor, useTooltipState } from "ariakit/tooltip";
import "./style.css";

export default function Example() {
  const tooltip = useTooltipState({
    placement: "right",
    fallbackPlacement: "bottom",
    defaultVisible: true,
  });

  return (
    <>
      <TooltipAnchor state={tooltip} as={Button} className="button">
        Decrease the screen size to activate the fallback placement
      </TooltipAnchor>
      <Tooltip state={tooltip} className="tooltip">
        Tooltip
      </Tooltip>
    </>
  );
}
