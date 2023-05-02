import { useState } from "react";
import * as Ariakit from "@ariakit/react";
import { ConfirmDialog } from "../dialog-nested/confirm-dialog.js";
import "./style.css";

export default function Example() {
  const dialog = Ariakit.useDialogStore();
  const mounted = dialog.useState("mounted");
  const [nestedOpen, setNestedOpen] = useState(false);
  return (
    <>
      <Ariakit.Button onClick={dialog.show} className="button">
        Open dialog
      </Ariakit.Button>
      {mounted && (
        <Ariakit.Dialog store={dialog} className="dialog">
          <Ariakit.DialogHeading className="heading">
            Dialog
          </Ariakit.DialogHeading>
          <Ariakit.DialogDismiss className="button">
            Close
          </Ariakit.DialogDismiss>
          <Ariakit.Button
            className="button"
            onClick={() => setNestedOpen(true)}
          >
            Open nested dialog
          </Ariakit.Button>
          {!!nestedOpen && (
            <ConfirmDialog
              open={nestedOpen}
              onClose={() => setNestedOpen(false)}
            />
          )}
        </Ariakit.Dialog>
      )}
    </>
  );
}
