import * as Ariakit from "@ariakit/react";

// See https://github.com/ariakit/ariakit/issues/6339
//
// Only the backdrop is animated: it should fade in when the dialog opens and
// fade out when it closes. The dialog panel has no transition at all, so it
// snaps in place while the backdrop fades. Before the fix, the enter fade
// works, but on close the dialog hides instantly: the backdrop never receives
// `data-leave` and the exit fade is skipped.
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
`;

export default function Example() {
  const dialog = Ariakit.useDialogStore();
  return (
    <>
      <style>{css}</style>
      <Ariakit.Button onClick={dialog.show}>Show dialog</Ariakit.Button>
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
    </>
  );
}
