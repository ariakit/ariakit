import { Button } from "ariakit/button";
import {
  Dialog,
  DialogDismiss,
  DialogHeading,
  useDialogState,
} from "ariakit/dialog";
import "./style.css";

export default function Example() {
  const dialog = useDialogState({ animated: true });
  return (
    <>
      <Button onClick={dialog.toggle} className="button">
        View details
      </Button>
      <Dialog state={dialog} className="dialog">
        <header className="header">
          <DialogHeading className="heading">Apples</DialogHeading>
          <DialogDismiss className="button dismiss" />
        </header>
        <div className="content">
          <ul>
            <li>
              <strong>Calories:</strong> 95
            </li>
            <li>
              <strong>Carbs:</strong> 25 grams
            </li>
            <li>
              <strong>Fibers:</strong> 4 grams
            </li>
            <li>
              <strong>Vitamin C:</strong> 14% of the Reference Daily Intake
              (RDI)
            </li>
            <li>
              <strong>Potassium:</strong> 6% of the RDI
            </li>
            <li>
              <strong>Vitamin K:</strong> 5% of the RDI
            </li>
          </ul>
        </div>
        <div className="footer">
          <Button className="button" onClick={dialog.hide}>
            Close
          </Button>
        </div>
      </Dialog>
    </>
  );
}
