import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  // const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const store = Ariakit.useDialogStore({ open: open2, setOpen: setOpen2 });
  // const store2 = Ariakit.useDialogStore({
  //   store,
  //   open: open,
  //   setOpen: setOpen,
  // });
  // useEffect(() => {
  //   console.log(open, open2);
  // }, [open, open2]);
  return (
    <>
      <Ariakit.Button onClick={() => setOpen2(true)} className="button">
        Show modal
      </Ariakit.Button>
      <Ariakit.Dialog
        // store={store2}
        store={store}
        // open={open}
        // onClose={() => setOpen(false)}
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
    </>
  );
}
