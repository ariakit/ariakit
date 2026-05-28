import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  const [closeCount, setCloseCount] = useState(0);
  const dialog = Ariakit.useDialogStore({ open, setOpen });

  return (
    <>
      <Ariakit.Button className="px-2 py-1" onClick={() => setOpen(true)}>
        Show modal
      </Ariakit.Button>
      <p>Close count: {closeCount}</p>
      <Ariakit.Dialog
        store={dialog}
        onClose={(event) => {
          event.preventDefault();
          setCloseCount((count) => count + 1);
          setOpen(false);
        }}
        className="fixed inset-3 m-auto flex h-fit max-h-[calc(100dvh-1.5rem)] w-96 max-w-[calc(100dvw-1.5rem)] flex-col gap-4 overflow-auto rounded-lg bg-white p-6 text-black shadow-xl"
      >
        <Ariakit.DialogHeading className="m-0 text-xl font-semibold">
          Success
        </Ariakit.DialogHeading>
        <p>
          Your payment has been successfully processed. We have emailed your
          receipt.
        </p>
        <Ariakit.DialogDismiss className="px-2 py-1">OK</Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </>
  );
}
