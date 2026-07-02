import * as Ariakit from "@ariakit/react";

// See https://github.com/ariakit/ariakit/issues/6339
//
// The backdrop has a 500ms opacity transition: it should fade in when the
// dialog opens and fade out when it closes. There are two dialogs:
//
// - "Show dialog": the panel has no transition at all, so it snaps in place
//   while the backdrop fades. Before the fix, the enter fade works, but on
//   close the dialog hides instantly: the backdrop never receives
//   `data-leave` and the exit fade is skipped.
// - "Show fast dialog": the panel has a shorter 150ms transition. Before the
//   fix, the panel's own timeout stopped the shared animation state early,
//   hiding the backdrop at 150ms and cutting its 500ms exit fade short.
//
// The styles are inlined in a <style> tag (rather than a style.css import) on
// purpose: CSS imports are only processed in vitest for the allowlist in the
// root vitest.config.ts, which doesn't include this sandbox, so a style.css
// refactor would strip the backdrop transition from the happy-dom test.
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
        backdrop={<div className="backdrop" />}
        className="dialog dialog-fast"
      >
        <Ariakit.DialogHeading>Fast</Ariakit.DialogHeading>
        <p>
          The panel fades in over 150ms while the backdrop fades over 500ms. On
          close, the backdrop should finish its longer fade out.
        </p>
        <Ariakit.DialogDismiss>Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </>
  );
}
