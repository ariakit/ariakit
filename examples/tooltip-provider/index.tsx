import "./style.css";
import * as Ariakit from "@ariakit/react";
import { TooltipProvider } from "@ariakit/react-core/tooltip/tooltip-provider";

export default function Example() {
  return (
    <TooltipProvider>
      <Ariakit.TooltipAnchor
        className="link"
        render={<a href="https://ariakit.org/components/tooltip" />}
      >
        Tooltip
      </Ariakit.TooltipAnchor>
      <Ariakit.Tooltip className="tooltip">
        https://ariakit.org/components/tooltip
      </Ariakit.Tooltip>
    </TooltipProvider>
  );
}
