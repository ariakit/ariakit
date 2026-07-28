import * as Ariakit from "@ariakit/react";

export default function Example() {
  const dialog = Ariakit.useDialogStore({ open: true });
  return (
    <Ariakit.Dialog
      store={dialog}
      className="dialog fixed inset-x-4 top-20 mx-auto max-w-md rounded bg-white p-6"
      backdrop={<div className="backdrop fixed inset-0 bg-black/20" />}
    >
      <Ariakit.DialogHeading className="heading">Success</Ariakit.DialogHeading>
      <p className="description">
        Your payment has been successfully processed. We have emailed your
        receipt.
      </p>
      <div>
        <Ariakit.DialogDismiss className="button">OK</Ariakit.DialogDismiss>
      </div>
    </Ariakit.Dialog>
  );
}
