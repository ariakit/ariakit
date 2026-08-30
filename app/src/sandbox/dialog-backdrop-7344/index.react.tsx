import * as Ariakit from "@ariakit/react";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

// Regression fixture for https://github.com/ariakit/ariakit/issues/7344. The
// backdrop is fixed and covers the viewport, so the dialog has to be
// positioned as well. Otherwise it stays in flow behind the backdrop and the
// browser test cannot click the dismiss button.
const css = `
  .backdrop {
    background: rgb(0 0 0 / 0.4);
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

// TODO: Remove this workaround once the backdrop applies the attribute on its
// own. https://github.com/ariakit/ariakit/issues/7344
// The dialog still hides the backdrop through the inline `display: none` style
// it computes, so mirror that decision into the attribute. Keep the component
// outside `Example` so its identity stays stable across renders.
const Backdrop = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<"div">>(
  function Backdrop({ hidden, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        hidden={hidden ?? props.style?.display === "none"}
      />
    );
  },
);

export default function Example() {
  const dialog = Ariakit.useDialogStore();
  return (
    <>
      <style>{css}</style>
      <Ariakit.Button onClick={dialog.show}>Show dialog</Ariakit.Button>
      <Ariakit.Dialog
        store={dialog}
        backdrop={<Backdrop className="backdrop" />}
        className="dialog"
      >
        <Ariakit.DialogHeading>Success</Ariakit.DialogHeading>
        <p>
          While this dialog is closed, the backdrop must carry the{" "}
          <code>hidden</code> attribute, like the dialog itself.
        </p>
        <Ariakit.DialogDismiss>Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </>
  );
}
