import "./style.css";
import * as Ariakit from "@ariakit/react";

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
