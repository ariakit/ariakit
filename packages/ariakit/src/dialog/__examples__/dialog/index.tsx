import { Button } from "ariakit/button";
import {
  Dialog,
  DialogDismiss,
  DialogHeading,
  useDialogStore,
} from "ariakit/dialog/store";
import "./style.css";

export default function Example() {
  const dialog = useDialogStore();
  return (
    <>
      <Button onClick={dialog.toggle} className="button">
        Show modal
      </Button>
      <Dialog store={dialog} className="dialog">
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
