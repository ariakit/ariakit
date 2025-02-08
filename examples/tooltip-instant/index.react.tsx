import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <Ariakit.TooltipProvider timeout={0}>
      <Ariakit.TooltipAnchor className="button" render={<Ariakit.Button />}>
        Hover or focus on me
      </Ariakit.TooltipAnchor>
      <Ariakit.Tooltip className="tooltip">Tooltip</Ariakit.Tooltip>
    </Ariakit.TooltipProvider>
  );
}
