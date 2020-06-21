import * as React from "react";
import { Button } from "reakit/Button";
import { useDialogState, Dialog, DialogDisclosure } from "reakit/Dialog";

export default function DialogWithFocusLoss() {
  const dialog1 = useDialogState();
  const dialog2 = useDialogState({ modal: false });
  const [on, setOn] = React.useState(true);
  const [on2, setOn2] = React.useState(true);
  return (
    <>
      <DialogDisclosure {...dialog1}>Open dialog</DialogDisclosure>
      <Dialog
        {...dialog1}
        hideOnClickOutside={false}
        aria-label="Dialog with focus loss"
      >
        <Button onClick={(event) => event.currentTarget.blur()}>onClick</Button>
        <DialogDisclosure {...dialog2}>Open dialog 2</DialogDisclosure>
        <Dialog {...dialog2} aria-label="Dialog with focus loss">
          <Button onClick={(event) => event.currentTarget.blur()}>
            onClick
          </Button>
          {on && <Button onFocus={() => setOn(!on)}>On</Button>}
          <Button
            onFocus={() => setOn2(!on2)}
            style={{ display: on2 ? "block" : "none" }}
          >
            Display
          </Button>
        </Dialog>
      </Dialog>
    </>
  );
}
