import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

function ContextHideButton() {
  const dialog = Ariakit.useDialogContext();

  return (
    <Ariakit.Button className="px-2 py-1" onClick={() => dialog?.hide()}>
      Close programmatically with context
    </Ariakit.Button>
  );
}

export default function Example() {
  const [open, setOpen] = useState(false);
  const [closeCount, setCloseCount] = useState(0);
  const dialog = Ariakit.useDialogStore({ open, setOpen });
  const [externalOpen, setExternalOpen] = useState(false);
  const [externalCloseCount, setExternalCloseCount] = useState(0);
  const external = Ariakit.useDialogStore({
    open: externalOpen,
    setOpen: setExternalOpen,
  });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverCloseCount, setPopoverCloseCount] = useState(0);
  const popover = Ariakit.usePopoverStore({
    open: popoverOpen,
    setOpen: setPopoverOpen,
  });
  const [parentOpen, setParentOpen] = useState(false);
  const [parentCloseCount, setParentCloseCount] = useState(0);
  const parent = Ariakit.useDialogStore({
    open: parentOpen,
    setOpen: setParentOpen,
  });
  const [childOpen, setChildOpen] = useState(false);
  const [childCloseCount, setChildCloseCount] = useState(0);
  const child = Ariakit.useDialogStore({
    open: childOpen,
    setOpen: setChildOpen,
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
        <Ariakit.Button className="px-2 py-1" onClick={() => setOpen(false)}>
          Close programmatically with setOpen
        </Ariakit.Button>
        <ContextHideButton />
      </Ariakit.Dialog>

      <Ariakit.Button
        className="px-2 py-1"
        onClick={() => setExternalOpen(true)}
      >
        Show external dialog
      </Ariakit.Button>
      <Ariakit.DialogDismiss store={external} className="px-2 py-1">
        Close external dialog
      </Ariakit.DialogDismiss>
      <p>External close count: {externalCloseCount}</p>
      <Ariakit.Dialog
        store={external}
        modal={false}
        unmountOnHide
        onClose={(event) => {
          event.preventDefault();
          setExternalCloseCount((count) => count + 1);
          setExternalOpen(false);
        }}
        className="fixed inset-3 m-auto flex h-fit max-h-[calc(100dvh-1.5rem)] w-96 max-w-[calc(100dvw-1.5rem)] flex-col gap-4 overflow-auto rounded-lg bg-white p-6 text-black shadow-xl"
      >
        <Ariakit.DialogHeading className="m-0 text-xl font-semibold">
          External dialog
        </Ariakit.DialogHeading>
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
        <Ariakit.PopoverDismiss className="px-2 py-1">
          Close popover
        </Ariakit.PopoverDismiss>
        <Ariakit.PopoverDismiss store={popover} className="px-2 py-1">
          Close popover with explicit store
        </Ariakit.PopoverDismiss>
      </Ariakit.Popover>

      <Ariakit.Button className="px-2 py-1" onClick={() => setParentOpen(true)}>
        Show parent dialog
      </Ariakit.Button>
      <p>Parent close count: {parentCloseCount}</p>
      <p>Child close count: {childCloseCount}</p>
      <Ariakit.Dialog
        store={parent}
        unmountOnHide
        onClose={(event) => {
          event.preventDefault();
          setParentCloseCount((count) => count + 1);
          setChildOpen(false);
          setParentOpen(false);
        }}
        className="fixed inset-3 m-auto flex h-fit max-h-[calc(100dvh-1.5rem)] w-96 max-w-[calc(100dvw-1.5rem)] flex-col gap-4 overflow-auto rounded-lg bg-white p-6 text-black shadow-xl"
      >
        <Ariakit.DialogHeading className="m-0 text-xl font-semibold">
          Parent dialog
        </Ariakit.DialogHeading>
        <Ariakit.Button
          className="px-2 py-1"
          onClick={() => setChildOpen(true)}
        >
          Show child dialog
        </Ariakit.Button>
        <Ariakit.Dialog
          store={child}
          backdrop={false}
          onClose={(event) => {
            event.preventDefault();
            setChildCloseCount((count) => count + 1);
            setChildOpen(false);
          }}
        >
          <Ariakit.DialogHeading>Child dialog</Ariakit.DialogHeading>
          <Ariakit.DialogDismiss className="px-2 py-1">
            Close child
          </Ariakit.DialogDismiss>
          <Ariakit.DialogDismiss store={parent} className="px-2 py-1">
            Close parent from child
          </Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </Ariakit.Dialog>
    </>
  );
}
