import * as Ariakit from "@ariakit/react";

// Regression fixture for https://github.com/ariakit/ariakit/issues/6339.
// The backdrop must finish its own leave transition even when the panel has no
// transition or a shorter one. Keep these styles inline because Vitest does not
// process this sandbox's CSS imports in happy-dom.
const css = `
  .backdrop {
    background: rgb(0 0 0 / 0.4);
    opacity: 0;
    transition-property: opacity;
    transition-duration: 500ms;
    transition-timing-function: ease;
  }
  .backdrop[data-enter] {
    opacity: 1;
  }
  .backdrop-long[data-leave] {
    transition-duration: 2s;
  }
  .dialog {
    position: fixed;
    inset: 0.75rem;
    z-index: 50;
    margin: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 24rem;
    height: fit-content;
    max-width: calc(100vw - 1.5rem);
    border-radius: 1rem;
    background: white;
    color: black;
    padding: 1.5rem;
  }
  .dialog-fast {
    opacity: 0;
    transition-property: opacity;
    transition-duration: 150ms;
  }
  .dialog-fast[data-enter] {
    opacity: 1;
  }
`;

export default function Example() {
  const dialog = Ariakit.useDialogStore();
  const fastDialog = Ariakit.useDialogStore();
  return (
    <>
      <style>{css}</style>
      <Ariakit.Button onClick={dialog.show}>Show dialog</Ariakit.Button>
      <Ariakit.Button onClick={fastDialog.show}>
        Show fast dialog
      </Ariakit.Button>
      <Ariakit.Dialog
        store={dialog}
        backdrop={<div className="backdrop" />}
        className="dialog"
      >
        <Ariakit.DialogHeading>Success</Ariakit.DialogHeading>
        <p>
          Only the backdrop is animated: it should fade in when the dialog opens
          and fade out when it closes. The panel has no transitions.
        </p>
        <Ariakit.DialogDismiss>Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
      <Ariakit.Dialog
        store={fastDialog}
        backdrop={<div className="backdrop backdrop-long" />}
        className="dialog dialog-fast"
      >
        <Ariakit.DialogHeading>Fast</Ariakit.DialogHeading>
        <p>
          The panel fades in over 150ms while the backdrop fades in over 500ms.
          On close, the backdrop should finish its longer 2s fade out.
        </p>
        <Ariakit.DialogDismiss>Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </>
  );
}
