import * as Ariakit from "@ariakit/react";
import { useState } from "react";

// The backdrop covers the viewport, so the dialogs need a stacking context of
// their own to stay above it. Keep these styles inline because Vitest does not
// process this sandbox's CSS imports in happy-dom.
const css = `
  .backdrop {
    background: rgb(0 0 0 / 0.4);
  }
  .backdrop-high {
    background: rgb(0 0 0 / 0.8);
  }
  .dialog {
    position: fixed;
    inset: 0.75rem;
    z-index: 50;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 0.75rem;
    width: 20rem;
    height: fit-content;
    max-width: calc(100vw - 1.5rem);
    border-radius: 1rem;
    background: white;
    color: black;
    padding: 1.5rem;
  }
`;

export default function Example() {
  return (
    <div>
      <style>{css}</style>
      {/*
        Dimming the background is an appearance setting the user changes while
        the dialog stays open, so the draft they typed and the state their
        attachments hold have to survive it.
        https://github.com/ariakit/ariakit/issues/7335
      */}
      <ComposeDialog />
      {/*
        The same setting on a dialog that renders inline rather than in a
        portal, so the dialog element is reconciled among its own parent's
        children instead of the portal's.
        https://github.com/ariakit/ariakit/issues/7335
      */}
      <QuickNoteDialog />
    </div>
  );
}

function ComposeDialog() {
  const [dimmed, setDimmed] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  return (
    <Ariakit.DialogProvider>
      <Ariakit.DialogDisclosure>Compose</Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        className="dialog"
        // TODO: Remove this workaround once the fix ships. The sandbox stops
        // reproducing the bug while it is applied.
        // https://github.com/ariakit/ariakit/issues/7335
        backdrop={
          <div
            className={highContrast ? "backdrop backdrop-high" : "backdrop"}
            // Leave the property out while the backdrop is on. An explicit
            // `display: undefined` would override the `display: none` Ariakit
            // sets while the dialog is closed.
            style={dimmed ? undefined : { display: "none" }}
          />
        }
      >
        <Ariakit.DialogHeading>Compose</Ariakit.DialogHeading>
        <label>
          Message <input type="text" />
        </label>
        <Attachments />
        <DimBackground checked={dimmed} onChange={setDimmed} />
        {/*
          Turning this on re-renders the dialog with a new backdrop element
          while the backdrop stays truthy, so the wrapper's shape doesn't
          change. It's the control that tells the falsy/truthy boundary apart
          from an ordinary re-render.
        */}
        <label>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={(event) => setHighContrast(event.target.checked)}
          />{" "}
          High contrast backdrop
        </label>
        <Ariakit.DialogDismiss>Send</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  );
}

function QuickNoteDialog() {
  const [dimmed, setDimmed] = useState(true);
  return (
    <Ariakit.DialogProvider>
      <Ariakit.DialogDisclosure>Quick note</Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        modal={false}
        portal={false}
        className="dialog"
        // TODO: Remove this workaround once the fix ships.
        // https://github.com/ariakit/ariakit/issues/7335
        backdrop={
          <div
            className="backdrop"
            style={dimmed ? undefined : { display: "none" }}
          />
        }
      >
        <Ariakit.DialogHeading>Quick note</Ariakit.DialogHeading>
        <label>
          Note <input type="text" />
        </label>
        <Attachments />
        <DimBackground checked={dimmed} onChange={setDimmed} />
        <Ariakit.DialogDismiss>Save</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  );
}

interface DimBackgroundProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

// The setting lives above the dialog, the way an application preference does,
// so it outlives the dialog's subtree and can't be what the assertions measure.
function DimBackground({ checked, onChange }: DimBackgroundProps) {
  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />{" "}
      Dim the background
    </label>
  );
}

// The count lives in a child of the dialog, so it survives only when the
// dialog's subtree is preserved rather than recreated.
function Attachments() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Add attachment
      </button>{" "}
      <span role="status">Attachments: {count}</span>
    </div>
  );
}
