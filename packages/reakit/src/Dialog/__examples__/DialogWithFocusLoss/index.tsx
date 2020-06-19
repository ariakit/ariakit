import * as React from "react";
import { Button } from "reakit/Button";
import { useDialogState, Dialog, DialogDisclosure } from "reakit/Dialog";

export default function DialogWithFocusLoss() {
  const dialog = useDialogState();
  const [on, setOn] = React.useState(true);
  return (
    <>
      <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
      <Dialog {...dialog} aria-label="Dialog with focus loss">
        <Button onFocus={(event) => event.currentTarget.blur()}>Button</Button>
        {on && <Button onFocus={() => setOn(!on)}>Button</Button>}
      </Dialog>
    </>
  );
}
