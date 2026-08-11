import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [activations, setActivations] = useState(0);
  const countActivation = () => setActivations((count) => count + 1);
  const [accessRevoked, setAccessRevoked] = useState(false);

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

      {/* Accessible while disabled, but this consumer treats revealing the
      tooltip as activating the control and opts out of hover. Keyboard focus
      still shows it, because the prop only covers hover. */}
      <Ariakit.TooltipProvider timeout={0}>
        <Ariakit.TooltipAnchor
          showOnHoverWhenDisabled={false}
          render={
            <Ariakit.Button
              disabled
              accessibleWhenDisabled
              onClick={countActivation}
            />
          }
        >
          Archive file
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>You need permission to archive files</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>

      {/* The callback form, deciding from the anchor being hovered. Reading the
      reason off the element means a callback that never runs, or one that runs
      with the wrong target, reveals the tooltip instead of withholding it. */}
      <Ariakit.TooltipProvider timeout={0}>
        <Ariakit.TooltipAnchor
          data-reason="permission"
          showOnHoverWhenDisabled={(event) =>
            event.currentTarget.dataset.reason !== "permission"
          }
          render={
            <Ariakit.Button
              disabled
              accessibleWhenDisabled
              onClick={countActivation}
            />
          }
        >
          Restore file
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>You need permission to restore files</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>

      {/* The rendered markup declares itself unavailable the way a design
      system outside Ariakit would, keeping the control focusable and clickable.
      Ariakit never resolves that state, so nothing here is truly disabled: the
      anchor stays focusable and its tooltip opens on both hover and keyboard
      focus. Withholding it from pointer users only would invert the rule the
      truly disabled cases below enforce. */}
      <Ariakit.TooltipProvider timeout={0}>
        <Ariakit.TooltipAnchor
          render={<button type="button" aria-disabled="true" />}
        >
          Publish file
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>Publishing needs a reviewer</Ariakit.Tooltip>
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

      {/* The same scenario with the composition order flipped, so the disabled
      state lives below the anchor. The button renders a div because React skips
      mouse handlers on native controls carrying the `disabled` attribute, which
      would hide the anchor's own decision. */}
      <Ariakit.TooltipProvider timeout={0}>
        <Ariakit.TooltipAnchor
          render={
            <Ariakit.Button
              disabled
              style={{ pointerEvents: "auto" }}
              render={<div />}
            />
          }
        >
          Print file
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>Printing is unavailable</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>
      {/* A permission check that runs as the pointer arrives can turn this
      control from explainable into truly disabled while the show timeout is
      still pending, and a pointer resting on it never fires the mouseleave that
      would cancel the timeout. The rendered div keeps React dispatching mouse
      events once the control is truly disabled. */}
      <Ariakit.TooltipProvider timeout={150}>
        <Ariakit.TooltipAnchor
          onMouseMove={() => setAccessRevoked(true)}
          render={
            <Ariakit.Button
              disabled
              accessibleWhenDisabled={!accessRevoked}
              style={{ pointerEvents: "auto" }}
              render={<div />}
            />
          }
        >
          Sync file
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>Syncing needs access</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>

      {/* Enabled control with the same delayed provider, so the assertion on
      the anchor above fails if a delayed tooltip ever stops opening at all. */}
      <Ariakit.TooltipProvider timeout={150}>
        <Ariakit.TooltipAnchor render={<Ariakit.Button />}>
          Preview file
        </Ariakit.TooltipAnchor>
        <Ariakit.Tooltip>Opens a read-only preview</Ariakit.Tooltip>
      </Ariakit.TooltipProvider>

      {/* Enabled control sharing the counter, so the suppression assertions on
      the disabled anchors above can't pass just because the counter is dead. */}
      <Ariakit.Button onClick={countActivation}>Download file</Ariakit.Button>
    </div>
  );
}
