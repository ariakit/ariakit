import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)} className="button">
        Show modal
      </Ariakit.Button>
      <Ariakit.DialogProvider open={open} setOpen={setOpen}>
        <Ariakit.Dialog className="dialog">
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
      </Ariakit.DialogProvider>
    </>
  );
}
