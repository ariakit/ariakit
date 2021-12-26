import { Dialog, DialogDisclosure, useDialogState } from "ariakit/dialog";
import "./style.css";

export default function Example() {
  const dialog = useDialogState();
  return (
    <>
      <DialogDisclosure className="button" state={dialog}>
        Open dialog
      </DialogDisclosure>
      <Dialog className="dialog" state={dialog} aria-label="Welcome">
        Welcome to Ariakit!
      </Dialog>
    </>
  );
}
