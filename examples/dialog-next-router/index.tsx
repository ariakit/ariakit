import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const dialog = Ariakit.useDialogStore();
  return (
    <>
      <Ariakit.Button onClick={dialog.toggle} className="button">
        Show modal
      </Ariakit.Button>
      <Ariakit.Dialog store={dialog} className="dialog">
        <Ariakit.DialogHeading className="heading">
          Success
        </Ariakit.DialogHeading>
        <p className="description">
          Your payment has been successfully processed. We have emailed your
          receipt.
        </p>
        <div>
          <Ariakit.DialogDismiss className="button">OK</Ariakit.DialogDismiss>
        </div>
      </Ariakit.Dialog>
    </>
  );
}
