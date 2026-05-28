import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

export default function Example() {
  const [open, setOpen] = useState(false);
  const [closeCount, setCloseCount] = useState(0);
  const dialog = Ariakit.useDialogStore({ open, setOpen });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverCloseCount, setPopoverCloseCount] = useState(0);
  const popover = Ariakit.usePopoverStore({
    open: popoverOpen,
    setOpen: setPopoverOpen,
  });

  return (
    <>
      <Ariakit.Button className="px-2 py-1" onClick={() => setOpen(true)}>
        Show modal
      </Ariakit.Button>
      <p>Close count: {closeCount}</p>
      <Ariakit.Dialog
        store={dialog}
        unmountOnHide
        onClose={(event) => {
          event.preventDefault();
          setCloseCount((count) => count + 1);
          setOpen(false);
        }}
        className="dialog-3488 fixed inset-3 m-auto flex h-fit max-h-[calc(100dvh-1.5rem)] w-96 max-w-[calc(100dvw-1.5rem)] flex-col gap-4 overflow-auto rounded-lg bg-white p-6 text-black shadow-xl"
      >
        <Ariakit.DialogHeading className="m-0 text-xl font-semibold">
          Success
        </Ariakit.DialogHeading>
        <p>
          Your payment has been successfully processed. We have emailed your
          receipt.
        </p>
        <Ariakit.DialogDismiss className="px-2 py-1">OK</Ariakit.DialogDismiss>
        <Ariakit.DialogDismiss store={dialog} className="px-2 py-1">
          Close with explicit store
        </Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      <Ariakit.PopoverDisclosure store={popover} className="px-2 py-1">
        Show popover
      </Ariakit.PopoverDisclosure>
      <p>Popover close count: {popoverCloseCount}</p>
      <Ariakit.Popover
        store={popover}
        onClose={(event) => {
          event.preventDefault();
          setPopoverCloseCount((count) => count + 1);
          setPopoverOpen(false);
        }}
        className="fixed m-auto flex max-w-64 flex-col gap-4 rounded-lg bg-white p-4 text-black shadow-xl"
      >
        <Ariakit.PopoverHeading className="m-0 text-xl font-semibold">
          Popover content
        </Ariakit.PopoverHeading>
        <Ariakit.PopoverDismiss store={popover} className="px-2 py-1">
          Close popover with explicit store
        </Ariakit.PopoverDismiss>
      </Ariakit.Popover>
    </>
  );
}
