import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";
import { DialogProvider } from "@ariakit/react-core/dialog/dialog-provider";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)} className="button">
        Show modal
      </Ariakit.Button>
      <DialogProvider open={open} setOpen={setOpen} animated>
        <Ariakit.Dialog
          backdrop={<div className="backdrop" />}
          className="dialog"
        >
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
      </DialogProvider>
    </>
  );
}
