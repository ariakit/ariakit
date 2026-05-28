import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

function DialogWithStore() {
  const dialog = Ariakit.useDialogStore();
  return (
    <div>
      <Ariakit.Button className="button" onClick={dialog.show}>
        Show dialog with store
      </Ariakit.Button>
      <Ariakit.Dialog
        store={dialog}
        unmountOnHide
        backdrop={<div className="backdrop" />}
        className="dialog"
      >
        <Ariakit.DialogHeading className="heading">
          Dialog with store
        </Ariakit.DialogHeading>
        <p>This dialog waits for the closing animation before unmounting.</p>
        <Ariakit.DialogDismiss className="button">Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </div>
  );
}

function DialogWithoutStore() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Ariakit.Button className="button" onClick={() => setOpen(true)}>
        Show dialog without store
      </Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        unmountOnHide
        backdrop={<div className="backdrop" />}
        className="dialog"
      >
        <Ariakit.DialogHeading className="heading">
          Dialog without store
        </Ariakit.DialogHeading>
        <p>
          This dialog should wait for the closing animation before unmounting.
        </p>
        <Ariakit.DialogDismiss className="button">Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </div>
  );
}

export default function Example() {
  return (
    <div className="root">
      <DialogWithStore />
      <DialogWithoutStore />
    </div>
  );
}
