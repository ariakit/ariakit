import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)} className="button">
        Show modal
      </Ariakit.Button>
      <Ariakit.Dialog
        backdrop={false}
        open={open}
        onClose={() => setOpen(false)}
        render={(props) => (
          <div className="wrapper" hidden={!open}>
            <div
              className="dialog"
              {...props}
              // TODO: Remove when https://github.com/ariakit/ariakit/issues/5057 is fixed
              data-enter={props["data-open"] ? props["data-enter"] : undefined}
            />
          </div>
        )}
      >
        <Ariakit.DialogHeading className="heading">
          Success
        </Ariakit.DialogHeading>
        <p>
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
