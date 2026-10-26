import * as Ariakit from "@ariakit/react";
import { StrictMode, useState } from "react";
import "./style.css";

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

// The anchor can unmount while its tooltip stays mounted. Clicking the anchor
// or the remove button unmounts it.
function RemovableAnchorTooltip() {
  const [anchorShown, setAnchorShown] = useState(true);
  return (
    <>
      <Ariakit.TooltipProvider>
        {anchorShown && (
          <Ariakit.TooltipAnchor
            render={<button type="button" />}
            onClick={() => setAnchorShown(false)}
          >
            Strikethrough
          </Ariakit.TooltipAnchor>
        )}
        <Ariakit.Tooltip className="transition-tooltip">
          Strikethrough tooltip
        </Ariakit.Tooltip>
      </Ariakit.TooltipProvider>
      <button type="button" onClick={() => setAnchorShown(false)}>
        Remove strikethrough
      </button>
    </>
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
      <div role="toolbar" aria-label="Format" className="toolbar">
        <TransitionTooltip tool="Bold" />
        <TransitionTooltip tool="Italic" />
        <TransitionTooltip tool="Underline" />
        <RemovableAnchorTooltip />
      </div>
    </StrictMode>
  );
}
