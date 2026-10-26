import * as Ariakit from "@ariakit/react";
import { StrictMode } from "react";

const tooltipProps = {
  showTimeout: 500,
  skipTimeout: 100,
};

const rowStyle = {
  display: "flex",
  gap: 40,
  padding: 80,
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

function SharedTooltip() {
  const store = Ariakit.useTooltipContext();
  const anchorElement = Ariakit.useStoreState(store, "anchorElement");
  return <Ariakit.Tooltip>{anchorElement?.dataset.tooltip}</Ariakit.Tooltip>;
}

function SharedTooltipAnchors() {
  return (
    <Ariakit.TooltipProvider {...tooltipProps}>
      <Ariakit.TooltipAnchor
        data-tooltip="Shared first tooltip"
        render={<button type="button" />}
      >
        Shared first anchor
      </Ariakit.TooltipAnchor>
      <Ariakit.TooltipAnchor
        data-tooltip="Shared second tooltip"
        render={<button type="button" />}
      >
        Shared second anchor
      </Ariakit.TooltipAnchor>
      <SharedTooltip />
    </Ariakit.TooltipProvider>
  );
}

export default function Example() {
  return (
    <StrictMode>
      <div style={rowStyle}>
        <DelayedTooltip anchor="First anchor" tooltip="First tooltip" />
        <DelayedTooltip anchor="Second anchor" tooltip="Second tooltip" />
      </div>
      <div style={rowStyle}>
        <SharedTooltipAnchors />
      </div>
    </StrictMode>
  );
}
