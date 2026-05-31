import * as Ariakit from "@ariakit/react";
import { StrictMode } from "react";

const tooltipProps = {
  showTimeout: 500,
  skipTimeout: 100,
};

interface DelayedTooltipProps {
  anchor: string;
  tooltip: string;
}

function DelayedTooltip({ anchor, tooltip }: DelayedTooltipProps) {
  return (
    <Ariakit.TooltipProvider {...tooltipProps}>
      <Ariakit.TooltipAnchor render={<button type="button" />}>
        {anchor}
      </Ariakit.TooltipAnchor>
      <Ariakit.Tooltip>{tooltip}</Ariakit.Tooltip>
    </Ariakit.TooltipProvider>
  );
}

export default function Example() {
  return (
    <StrictMode>
      <div
        style={{
          display: "flex",
          gap: 40,
          padding: 80,
        }}
      >
        <DelayedTooltip anchor="First anchor" tooltip="First tooltip" />
        <DelayedTooltip anchor="Second anchor" tooltip="Second tooltip" />
      </div>
    </StrictMode>
  );
}
