import { useEffect, useRef } from "react";
import { Button } from "ariakit/button";
import {
  Dialog,
  DialogDismiss,
  DialogHeading,
  useDialogStore,
} from "ariakit/dialog/store";
import "./style.css";

export default function Example() {
  const ref = useRef<HTMLDetailsElement>(null);
  const dialog = useDialogStore();
  const mounted = dialog.useState("mounted");

  // Hydrate the dialog state. This is necessary because the user may have
  // opened the dialog before JavaScript has loaded.
  useEffect(() => dialog.setOpen(!!ref.current?.open), [dialog.setOpen]);

  return (
    <details
      ref={ref}
      open={mounted}
      onToggle={(event) => dialog.setOpen(event.currentTarget.open)}
    >
      <Button as="summary" className="button">
        Show modal
      </Button>
      <Dialog
        store={dialog}
        // We're setting the modal prop to true only when the dialog is open and
        // JavaScript is enabled. This means that the dialog will initially have
        // a non-modal state with no backdrop element, allowing users to
        // interact with the content behind. This is necessary because, before
        // JavaScript finishes loading, we can't automatically move focus to the
        // dialog.
        modal={mounted}
        hidden={false}
        className="dialog"
      >
        <DialogHeading className="heading">Success</DialogHeading>
        <p className="description">
          Your payment has been successfully processed. We have emailed your
          receipt.
        </p>
        <div>
          <DialogDismiss className="button">OK</DialogDismiss>
        </div>
      </Dialog>
    </details>
  );
}
