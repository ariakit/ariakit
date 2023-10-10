import "react-toastify/dist/ReactToastify.css";
import "./style.css";
import { useState } from "react";
import { Button, Dialog, DialogDismiss, DialogHeading } from "@ariakit/react";
import { ToastContainer, toast } from "react-toastify";

function Example() {
  const [open, setOpen] = useState(false);
  return (
    <div className="wrapper">
      <Button className="button" onClick={() => toast("Hello!")}>
        Say Hello
      </Button>
      <Button className="button" onClick={() => setOpen(true)}>
        Show modal
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        getPersistentElements={() => document.querySelectorAll(".Toastify")}
        backdrop={<div className="backdrop" />}
        className="dialog"
      >
        <DialogHeading className="heading">Notification</DialogHeading>
        <p className="description">
          Click on the button below to show a toast.
        </p>
        <div className="buttons">
          <Button className="button" onClick={() => toast("Hello!")}>
            Say Hello
          </Button>
          <DialogDismiss className="button secondary">Cancel</DialogDismiss>
        </div>
      </Dialog>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Example />
      <ToastContainer className="toast-container" />
    </>
  );
}
