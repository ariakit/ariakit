import { Button } from "ariakit/button";
import {
  Dialog,
  DialogDismiss,
  DialogHeading,
  useDialogState,
} from "ariakit/dialog";
import "./style.css";

export default function Example() {
  const dialog = useDialogState();
  return (
    <>
      <Button onClick={dialog.toggle} className="button">
        Show modal
      </Button>
      <Dialog state={dialog} className="dialog">
        <DialogHeading className="heading">Success</DialogHeading>
        <p className="description">
          Your payment has been successfully processed. We have emailed your
          receipt.
        </p>
        <div>
          <DialogDismiss className="button">OK</DialogDismiss>
        </div>
      </Dialog>
    </>
  );
}
