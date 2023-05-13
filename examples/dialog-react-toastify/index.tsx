import * as Ariakit from "@ariakit/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style.css";

function Example() {
  const dialog = Ariakit.useDialogStore();
  return (
    <div className="wrapper">
      <Ariakit.Button className="button" onClick={() => toast("Hello!")}>
        Say Hello
      </Ariakit.Button>
      <Ariakit.Button className="button" onClick={dialog.show}>
        Show modal
      </Ariakit.Button>
      <Ariakit.Dialog
        store={dialog}
        backdrop={<div className="backdrop" />}
        getPersistentElements={() => document.querySelectorAll(".Toastify")}
        className="dialog"
      >
        <Ariakit.DialogHeading className="heading">
          Notification
        </Ariakit.DialogHeading>
        <p className="description">
          Click on the button below to show a toast.
        </p>
        <div className="buttons">
          <Ariakit.Button className="button" onClick={() => toast("Hello!")}>
            Say Hello
          </Ariakit.Button>
          <Ariakit.DialogDismiss className="button secondary">
            Cancel
          </Ariakit.DialogDismiss>
        </div>
      </Ariakit.Dialog>
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
