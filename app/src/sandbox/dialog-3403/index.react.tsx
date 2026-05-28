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

function DialogWithWorkaround() {
  const [open, setOpen] = useState(false);
  // TODO: Remove this explicit store workaround once
  // https://github.com/ariakit/ariakit/issues/3403 is fixed.
  const dialog = Ariakit.useDialogStore({
    open,
    setOpen,
  });
  return (
    <div>
      <Ariakit.Button className="button" onClick={() => setOpen(true)}>
        Show dialog with workaround
      </Ariakit.Button>
      <Ariakit.Dialog
        store={dialog}
        unmountOnHide
        backdrop={<div className="backdrop" />}
        className="dialog"
      >
        <Ariakit.DialogHeading className="heading">
          Dialog with workaround
        </Ariakit.DialogHeading>
        <p>This dialog waits for the closing animation before unmounting.</p>
        <Ariakit.DialogDismiss className="button">Close</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </div>
  );
}

export default function Example() {
  return (
    <div className="root">
      <DialogWithStore />
      <DialogWithWorkaround />
    </div>
  );
}
