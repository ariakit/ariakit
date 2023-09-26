import { useEffect, useState } from "react";
import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const [open, setOpen] = useState(false);
  const confirm = Ariakit.useDialogStore();
  const dialog = Ariakit.useDialogStore({
    open,
    setOpen(open) {
      if (!open && !confirm.getState().open) {
        return confirm.show();
        return;
      }
      setOpen(open);
    },
  });

  const lol = dialog.useState("mounted");
  const confirmOpen = confirm.useState("open");

  useEffect(() => {
    console.log(lol, open);
  }, [lol]);

  return (
    <>
      <Ariakit.Button onClick={dialog.show} className="button">
        View Cart
      </Ariakit.Button>

      <Ariakit.Dialog
        store={dialog}
        backdrop={<div className="backdrop" />}
        className="dialog"
      >
        <div className="header">
          <Ariakit.DialogHeading className="heading">
            Your Shopping Cart
          </Ariakit.DialogHeading>
          <Ariakit.DialogDismiss className="button secondary dismiss" />
        </div>
      </Ariakit.Dialog>
      {confirmOpen && (
        <Ariakit.Dialog
          backdrop={<div className="backdrop" />}
          className="dialog"
          store={confirm}
        >
          <div className="header">
            <Ariakit.DialogHeading className="heading">
              Are you sure?
            </Ariakit.DialogHeading>
            <Ariakit.DialogDismiss className="button secondary dismiss" />
          </div>
          <div className="body">
            <p>Are you sure you want to close the dialog?</p>
          </div>
          <div className="footer">
            <Ariakit.DialogDismiss className="button secondary">
              Cancel
            </Ariakit.DialogDismiss>
            <Ariakit.DialogDismiss
              className="button primary"
              onClick={dialog.hide}
            >
              Confirm
            </Ariakit.DialogDismiss>
          </div>
        </Ariakit.Dialog>
      )}
    </>
  );
}
