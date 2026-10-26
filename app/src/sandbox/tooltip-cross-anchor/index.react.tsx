import * as Ariakit from "@ariakit/react";
import { StrictMode } from "react";
import "./style.css";

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

interface TransitionTooltipProps {
  tool: string;
}

function TransitionTooltip({ tool }: TransitionTooltipProps) {
  return (
    <Ariakit.TooltipProvider>
      <Ariakit.TooltipAnchor render={<button type="button" />}>
        {tool}
      </Ariakit.TooltipAnchor>
      <Ariakit.Tooltip className="transition-tooltip">
        {tool} tooltip
      </Ariakit.Tooltip>
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
      <div role="toolbar" aria-label="Format" className="toolbar">
        <TransitionTooltip tool="Bold" />
        <TransitionTooltip tool="Italic" />
        <TransitionTooltip tool="Underline" />
      </div>
    </StrictMode>
  );
}
