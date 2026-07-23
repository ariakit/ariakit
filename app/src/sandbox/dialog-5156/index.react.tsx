import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)} className="px-2 py-1">
        Show dialog
      </Ariakit.Button>
      <button type="button">Outside target</button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        backdrop={false}
        className="fixed inset-x-0 top-16 z-50 mx-auto max-w-96 rounded-lg bg-white p-4 shadow-lg"
      >
        <Ariakit.DialogHeading className="text-xl font-semibold">
          Dialog
        </Ariakit.DialogHeading>
        <p>
          While this dialog is open, Ariakit listens for interactions outside of
          it on the document.
        </p>
        <Ariakit.DialogDismiss className="px-2 py-1">OK</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </>
  );
}
