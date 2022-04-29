import { Button } from "ariakit/button";
import {
  Dialog,
  DialogDismiss,
  DialogHeading,
  useDialogState,
} from "ariakit/dialog";
import "./style.css";

export default function Example() {
  const dialog = useDialogState({
    animated: true,
  });
  return (
    <>
      <Button
        onClick={dialog.toggle}
        aria-label="Open modal details"
        className="button"
      >
        Open modal details
      </Button>
      <Dialog state={dialog} className="dialog">
        <header className="header">
          <DialogHeading className="heading">Dialog title</DialogHeading>
          <DialogDismiss className="button dismiss" />
        </header>
        <div className="content">
          <p>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
            dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta
            ac consectetur ac, vestibulum at eros.
          </p>
          <p>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
            Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor
            auctor.
          </p>
        </div>
        <div className="footer">
          <button
            type="button"
            className="button"
            aria-label="Hide dialog"
            onClick={dialog.hide}
          >
            Submit
          </button>
        </div>
      </Dialog>
    </>
  );
}
