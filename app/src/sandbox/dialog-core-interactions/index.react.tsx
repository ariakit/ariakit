import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import { flushSync } from "react-dom";

function ModalDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)}>Show modal</Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        style={{ position: "relative", zIndex: 1 }}
      >
        <Ariakit.DialogHeading>Success</Ariakit.DialogHeading>
        <p>Your payment has been successfully processed.</p>
        <Ariakit.DialogDismiss>OK</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
      <button>Outside dialog</button>
    </>
  );
}

// React 17 and flushSync commit the close inside onClose, before the dialog
// returns from dispatching the close event.
function SynchronousCloseDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)}>
        Show details
      </Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        modal={false}
        onClose={() => flushSync(() => setOpen(false))}
      >
        <Ariakit.DialogHeading>Details</Ariakit.DialogHeading>
        <Ariakit.DialogDismiss>Close details</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
      <p>Text outside the details</p>
    </>
  );
}

// onClose runs before the open state changes, so hiding the store from onClose
// makes a second hide request while the first one is still running.
function HideFromCloseDialog() {
  const dialog = Ariakit.useDialogStore();
  const [closes, setCloses] = useState(0);

  return (
    <>
      <Ariakit.Button onClick={dialog.show}>Show settings</Ariakit.Button>
      <Ariakit.Dialog
        store={dialog}
        modal={false}
        onClose={() => {
          setCloses((count) => count + 1);
          dialog.hide();
        }}
      >
        <Ariakit.DialogHeading>Settings</Ariakit.DialogHeading>
        <Ariakit.DialogDismiss>Close settings</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
      <p>Settings close events: {closes}</p>
    </>
  );
}

export default function Example() {
  return (
    <>
      <ModalDialog />
      <SynchronousCloseDialog />
      <HideFromCloseDialog />
    </>
  );
}
