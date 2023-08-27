import "./style.css";
import { useEffect, useRef, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { DialogProvider } from "@ariakit/react-core/dialog/dialog-provider";

function useLoaded() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), []);
  return loaded;
}

export default function Example() {
  const ref = useRef<HTMLDetailsElement>(null);
  const loaded = useLoaded();
  const [open, setOpen] = useState(false);

  // Hydrate the dialog state. This is necessary because the user may have
  // opened the dialog before JavaScript has loaded.
  useEffect(() => setOpen(!!ref.current?.open), []);

  return (
    <details
      ref={ref}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <Ariakit.Button className="button" render={<summary />}>
        Show modal
      </Ariakit.Button>
      <DialogProvider open={open} setOpen={setOpen}>
        <Ariakit.Dialog
          // We're setting the modal prop to true only when JavaScript is enabled.
          // This means that the dialog will initially have a non-modal state with
          // no backdrop element, allowing users to interact with the content
          // behind. This is necessary because, before JavaScript finishes
          // loading, we can't automatically move focus to the dialog.
          modal={loaded}
          backdrop={loaded && <div className="backdrop" />}
          alwaysVisible={!loaded}
          className="dialog"
        >
          <Ariakit.DialogHeading className="heading">
            Success
          </Ariakit.DialogHeading>
          <p className="description">
            Your payment has been successfully processed. We have emailed your
            receipt.
          </p>
          <div>
            <Ariakit.DialogDismiss className="button">OK</Ariakit.DialogDismiss>
          </div>
        </Ariakit.Dialog>
      </DialogProvider>
    </details>
  );
}
