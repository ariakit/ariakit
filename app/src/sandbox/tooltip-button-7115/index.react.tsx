import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [activations, setActivations] = useState(0);
  const countActivation = () => setActivations((count) => count + 1);

  return (
    <div style={{ display: "grid", gap: 48, justifyItems: "start" }}>
      <p>Activations: {activations}</p>

      {/* Disabled, but still keyboard accessible. The tooltip anchor renders
      the button, so the rendered element is the button. */}
      <Ariakit.TooltipProvider timeout={0}>
        <Ariakit.TooltipAnchor
          render={
            <Ariakit.Button
              disabled
              accessibleWhenDisabled
              onClick={countActivation}
            />
          }
        >
          Delete file
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>You need permission to delete files</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>

      {/* The same scenario with the composition order flipped. The button
      renders the tooltip anchor, so the innermost render element wins and this
      renders a div with role="button". */}
      <Ariakit.TooltipProvider timeout={0}>
        <Ariakit.Button
          disabled
          accessibleWhenDisabled
          onClick={countActivation}
          render={<Ariakit.TooltipAnchor />}
        >
          Share file
        </Ariakit.Button>
        <Ariakit.Tooltip>You need permission to share files</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>

      {/* No composition at all: the anchor carries the disabled props itself,
      so it sees them in its own props rather than inheriting them. */}
      <Ariakit.TooltipProvider timeout={0}>
        <Ariakit.TooltipAnchor
          disabled
          accessibleWhenDisabled
          onClick={countActivation}
          render={<button type="button" />}
        >
          Export file
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>You need permission to export files</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>

      {/* Truly disabled: the tooltip content is unreachable with the keyboard,
      so it must not be exposed to pointer users either. */}
      <Ariakit.TooltipProvider timeout={0}>
        <Ariakit.TooltipAnchor render={<Ariakit.Button disabled />}>
          Rename file
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>Renaming is unavailable</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>

      {/* The same scenario with the composition order flipped. */}
      <Ariakit.TooltipProvider timeout={0}>
        <Ariakit.Button disabled render={<Ariakit.TooltipAnchor />}>
          Move file
        </Ariakit.Button>
        <Ariakit.Tooltip>Moving is unavailable</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>

      {/* Truly disabled, but the consumer restores pointer events so the
      control can still be hovered. Nothing keeps the pointer away from this
      anchor, so the resolved disabled state is the only thing that can keep the
      tooltip closed. */}
      <Ariakit.TooltipProvider timeout={0}>
        <Ariakit.Button
          disabled
          style={{ pointerEvents: "auto" }}
          render={<Ariakit.TooltipAnchor />}
        >
          Duplicate file
        </Ariakit.Button>
        <Ariakit.Tooltip>Duplicating is unavailable</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>
      {/* Enabled control sharing the counter, so the suppression assertions on
      the disabled anchors above can't pass just because the counter is dead. */}
      <Ariakit.Button onClick={countActivation}>Download file</Ariakit.Button>
    </div>
  );
}
