import * as Ariakit from "@ariakit/react";

export default function Example() {
  const dialog = Ariakit.useDialogStore();
  return (
    <>
      <Ariakit.Button onClick={dialog.show}>Show modal</Ariakit.Button>
      <Ariakit.Dialog
        store={dialog}
        backdrop
        className="opacity-0 transition-opacity duration-150 data-enter:opacity-100"
      >
        <Ariakit.DialogHeading>Success</Ariakit.DialogHeading>
        <p className="description">
          Your payment has been successfully processed. We have emailed your
          receipt.
        </p>
        <div>
          <Ariakit.DialogDismiss>OK</Ariakit.DialogDismiss>
        </div>
      </Ariakit.Dialog>
    </>
  );
}
