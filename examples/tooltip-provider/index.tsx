import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <Ariakit.TooltipProvider>
      <Ariakit.TooltipAnchor
        className="link"
        render={<a href="https://ariakit.org/components/tooltip" />}
      >
        Tooltip
      </Ariakit.TooltipAnchor>
      <Ariakit.Tooltip className="tooltip">
        https://ariakit.org/components/tooltip
      </Ariakit.Tooltip>
    </Ariakit.TooltipProvider>
  );
}
