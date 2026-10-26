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

// TODO: Remove this workaround after the fix for
// https://github.com/ariakit/ariakit/issues/8089 is released.
function SharedTooltipAnchor(props: Ariakit.TooltipAnchorProps) {
  const store = Ariakit.useTooltipContext();
  return (
    <Ariakit.TooltipAnchor
      {...props}
      onMouseEnter={(event) => {
        props.onMouseEnter?.(event);
        if (event.defaultPrevented) return;
        if (store?.getState().anchorElement === event.currentTarget) return;
        store?.setAnchorElement(event.currentTarget);
      }}
    />
  );
}

function SharedTooltipAnchors() {
  return (
    <Ariakit.TooltipProvider {...tooltipProps}>
      <SharedTooltipAnchor
        data-tooltip="Shared first tooltip"
        render={<button type="button" />}
      >
        Shared first anchor
      </SharedTooltipAnchor>
      <SharedTooltipAnchor
        data-tooltip="Shared second tooltip"
        render={<button type="button" />}
      >
        Shared second anchor
      </SharedTooltipAnchor>
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
