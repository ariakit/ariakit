import * as React from "react";
import { Button } from "reakit/Button";
import { useDialogState, Dialog, DialogDisclosure } from "reakit/Dialog";

export default function DialogWithFocusLoss() {
  const dialog = useDialogState();
  React.useEffect(() => {
    if (dialog.visible) {
      const { activeElement } = document;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }
  }, [dialog.visible]);
  return (
    <>
      <DialogDisclosure {...dialog}>Open dialog</DialogDisclosure>
      <Dialog {...dialog} aria-label="Dialog with focus loss">
        <Button onClick={dialog.hide}>Close</Button>
      </Dialog>
    </>
  );
}
