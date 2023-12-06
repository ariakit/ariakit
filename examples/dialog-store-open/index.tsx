import "./style.css";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const dialog = Ariakit.useDialogStore({ open: true });
  return (
    <Ariakit.Dialog
      store={dialog}
      className="dialog"
      backdrop={<div className="backdrop" />}
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
