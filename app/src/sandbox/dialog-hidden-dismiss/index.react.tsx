import * as Ariakit from "@ariakit/react";

export default function Example() {
  return (
    <div>
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Terms</Ariakit.DialogDisclosure>
        <Ariakit.Dialog>
          <Ariakit.DialogHeading>Terms</Ariakit.DialogHeading>
          <p>You must accept the terms before continuing.</p>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      {/*
        A nested dialog disables everything outside itself, which includes the
        outer dialog's hidden dismiss button, since that renders next to the
        outer dialog rather than inside it. Closing the nested dialog has to
        bring the button back.
        https://github.com/ariakit/ariakit/issues/7310
      */}
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Shipping</Ariakit.DialogDisclosure>
        <Ariakit.Dialog>
          <Ariakit.DialogHeading>Shipping</Ariakit.DialogHeading>
          <Ariakit.DialogProvider>
            <Ariakit.DialogDisclosure>Edit address</Ariakit.DialogDisclosure>
            <Ariakit.Dialog>
              <Ariakit.DialogHeading>Edit address</Ariakit.DialogHeading>
              <Ariakit.DialogDismiss>Save</Ariakit.DialogDismiss>
            </Ariakit.Dialog>
          </Ariakit.DialogProvider>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      {/*
        A dialog that never takes focus keeps checking whether each event target
        is one of its own, instead of trusting elements marked as outside. Its
        hidden dismiss button renders next to it and carries no such mark, so
        focusing the button reads as an interaction outside unless the dialog
        recognizes it. https://github.com/ariakit/ariakit/issues/7310
      */}
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Preferences</Ariakit.DialogDisclosure>
        <Ariakit.Dialog autoFocusOnShow={false}>
          <Ariakit.DialogHeading>Preferences</Ariakit.DialogHeading>
          <p>Choose how often you want to be notified.</p>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Receipt</Ariakit.DialogDisclosure>
        <Ariakit.Dialog>
          <Ariakit.DialogHeading>Receipt</Ariakit.DialogHeading>
          <p>Your payment has been processed.</p>
          <Ariakit.DialogDismiss>Done</Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
    </div>
  );
}
