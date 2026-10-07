import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export default function Example() {
  return (
    <div>
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Terms</Ariakit.DialogDisclosure>
        <Ariakit.Dialog>
          <Ariakit.DialogHeading>Terms</Ariakit.DialogHeading>
          <p>You must accept the terms before continuing.</p>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      {/*
        A nested dialog disables everything outside itself, which includes the
        outer dialog's hidden dismiss button, since that renders next to the
        outer dialog rather than inside it. Closing the nested dialog has to
        bring the button back.
        https://github.com/ariakit/ariakit/issues/7310
      */}
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Shipping</Ariakit.DialogDisclosure>
        <Ariakit.Dialog>
          <Ariakit.DialogHeading>Shipping</Ariakit.DialogHeading>
          <Ariakit.DialogProvider>
            <Ariakit.DialogDisclosure>Edit address</Ariakit.DialogDisclosure>
            <Ariakit.Dialog>
              <Ariakit.DialogHeading>Edit address</Ariakit.DialogHeading>
              <Ariakit.DialogDismiss>Save</Ariakit.DialogDismiss>
            </Ariakit.Dialog>
          </Ariakit.DialogProvider>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      {/*
        A dialog that never takes focus keeps checking whether each event target
        is one of its own, instead of trusting elements marked as outside. Its
        hidden dismiss button renders next to it and carries no such mark, so
        focusing the button reads as an interaction outside unless the dialog
        recognizes it. https://github.com/ariakit/ariakit/issues/7310
      */}
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Preferences</Ariakit.DialogDisclosure>
        <Ariakit.Dialog autoFocusOnShow={false}>
          <Ariakit.DialogHeading>Preferences</Ariakit.DialogHeading>
          <p>Choose how often you want to be notified.</p>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Receipt</Ariakit.DialogDisclosure>
        <Ariakit.Dialog>
          <Ariakit.DialogHeading>Receipt</Ariakit.DialogHeading>
          <p>Your payment has been processed.</p>
          <Ariakit.DialogDismiss>Done</Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      {/*
        A nested popover is non-modal, and `portal` defaults to `modal`, so it
        renders inline inside the dialog. It also stays rendered while closed,
        so its dismiss button sits in the dialog's subtree before the user opens
        it. That button closes the popover, not the dialog.
        https://github.com/ariakit/ariakit/issues/7321
       */}
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Compose</Ariakit.DialogDisclosure>
        <Ariakit.Dialog>
          <Ariakit.DialogHeading>Compose</Ariakit.DialogHeading>
          <Ariakit.PopoverProvider>
            <Ariakit.PopoverDisclosure>Formatting</Ariakit.PopoverDisclosure>
            <Ariakit.Popover>
              <Ariakit.PopoverHeading>Formatting</Ariakit.PopoverHeading>
              <Ariakit.PopoverDismiss>Close formatting</Ariakit.PopoverDismiss>
            </Ariakit.Popover>
          </Ariakit.PopoverProvider>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      {/*
        The dialog's own dismiss usually comes after a nested popup's in
        document order, and it usually sits in a wrapper element rather than
        directly under the dialog. Neither can hide it from the dialog.
        https://github.com/ariakit/ariakit/issues/7321
      */}
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Share</Ariakit.DialogDisclosure>
        <Ariakit.Dialog>
          <Ariakit.DialogHeading>Share</Ariakit.DialogHeading>
          <Ariakit.PopoverProvider>
            <Ariakit.PopoverDisclosure>Permissions</Ariakit.PopoverDisclosure>
            <Ariakit.Popover>
              <Ariakit.PopoverHeading>Permissions</Ariakit.PopoverHeading>
              <Ariakit.PopoverDismiss>Close permissions</Ariakit.PopoverDismiss>
            </Ariakit.Popover>
          </Ariakit.PopoverProvider>
          <div>
            <Ariakit.DialogDismiss>Cancel</Ariakit.DialogDismiss>
          </div>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      {/*
        Same composition through the menu modules: a submenu is never modal, so
        it renders inline inside the modal menu, and its dismiss button closes
        the submenu alone. That leaves the modal menu with no dismiss of its
        own. https://github.com/ariakit/ariakit/issues/7321
      */}
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton>Tools</Ariakit.MenuButton>
        <Ariakit.Menu modal>
          <Ariakit.MenuItem>Inspect</Ariakit.MenuItem>
          <Ariakit.MenuProvider>
            <Ariakit.MenuButton render={<Ariakit.MenuItem />}>
              More
            </Ariakit.MenuButton>
            <Ariakit.Menu>
              <Ariakit.MenuItem>Deep</Ariakit.MenuItem>
              <Ariakit.MenuDismiss>Close submenu</Ariakit.MenuDismiss>
            </Ariakit.Menu>
          </Ariakit.MenuProvider>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
      {/*
        Whether the dialog needs the fallback can change while it stays open, in
        both directions: a dialog that loads its content gains a dismiss
        control, and one that starts a task it can't cancel loses the control it
        had. https://github.com/ariakit/ariakit/issues/7321
       */}
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Activity</Ariakit.DialogDisclosure>
        <Ariakit.Dialog>
          <Ariakit.DialogHeading>Activity</Ariakit.DialogHeading>
          <ActivityBody />
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>Remove photo</Ariakit.DialogDisclosure>
        <Ariakit.Dialog>
          <Ariakit.DialogHeading>Remove photo</Ariakit.DialogHeading>
          <RemovePhotoBody />
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
      <CheckoutDialog />
      <RefundDialog />
    </div>
  );
}

// The state lives below the dialog, the way content that loads on its own does,
// so that mounting the dismiss control doesn't render the dialog again.
// https://github.com/ariakit/ariakit/issues/7321
function ActivityBody() {
  const [loaded, setLoaded] = useState(false);
  // The wrapper outlives the state change, so the dismiss control appears below
  // the dialog's own children rather than among them.
  return (
    <div>
      {loaded ? (
        <>
          <p>You have no recent activity.</p>
          <Ariakit.DialogDismiss>Close</Ariakit.DialogDismiss>
        </>
      ) : (
        <button onClick={() => setLoaded(true)}>Load entries</button>
      )}
    </div>
  );
}

// Same invariant as `ActivityBody`: the dialog doesn't render again when the
// dismiss control goes away. This one keeps the control among the dialog's own
// children, so the two cover both depths.
function RemovePhotoBody() {
  const [removing, setRemoving] = useState(false);
  if (removing) {
    return <p>Removing the photo. This can't be undone.</p>;
  }
  return (
    <>
      <button onClick={() => setRemoving(true)}>Remove</button>
      <Ariakit.DialogDismiss>Keep photo</Ariakit.DialogDismiss>
    </>
  );
}

interface BodyPortalProps {
  children: ReactNode;
}

// Renders its children as children of the body, like an application that has
// the body as its root.
function BodyPortal({ children }: BodyPortalProps) {
  const [mounted, setMounted] = useState(false);
  // The body is available only after client hydration.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// The checkout renders in a portal while the gift note is empty, so it moves
// out of the portal to the body while both dialogs are open. The hidden dismiss
// button renders next to the dialog, and the one in the body is new. The gift
// note is outside the tree of the checkout and opened after it, so it must
// disable that button too.
// https://github.com/ariakit/ariakit/issues/7775
function CheckoutDialog() {
  const [open, setOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)}>Checkout</Ariakit.Button>
      <BodyPortal>
        <Ariakit.Dialog
          open={open}
          onClose={() => setOpen(false)}
          portal={!note}
        >
          <Ariakit.DialogHeading>Checkout</Ariakit.DialogHeading>
          <Ariakit.Button onClick={() => setNoteOpen(true)}>
            Add gift note
          </Ariakit.Button>
        </Ariakit.Dialog>
        {/*
          The gift note mounts when it opens. The checkout disables the elements
          that are in the page when it opens, and the gift note must not be one
          of them.
        */}
        <Ariakit.Dialog
          open={noteOpen}
          onClose={() => setNoteOpen(false)}
          unmountOnHide
        >
          <Ariakit.DialogHeading>Gift note</Ariakit.DialogHeading>
          <label>
            Note
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          <Ariakit.DialogDismiss>Save</Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </BodyPortal>
    </>
  );
}

// The refund can't be canceled after the reason has text, so it loses its
// dismiss button while both dialogs are open. The hidden dismiss button then
// mounts next to the refund, which keeps its element. The reason is nested in
// the refund, so its portal is next to that button, and it opened before the
// button was in the page. It must disable that button too.
// https://github.com/ariakit/ariakit/issues/7775
// https://github.com/ariakit/ariakit/issues/7782
function RefundDialog() {
  const [open, setOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)}>Refund</Ariakit.Button>
      <Ariakit.Dialog open={open} onClose={() => setOpen(false)}>
        <Ariakit.DialogHeading>Refund</Ariakit.DialogHeading>
        <Ariakit.Button onClick={() => setReasonOpen(true)}>
          Add reason
        </Ariakit.Button>
        {!reason && <Ariakit.DialogDismiss>Keep order</Ariakit.DialogDismiss>}
        <Ariakit.Dialog open={reasonOpen} onClose={() => setReasonOpen(false)}>
          <Ariakit.DialogHeading>Reason</Ariakit.DialogHeading>
          <label>
            Reason
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          <Ariakit.DialogDismiss>Save reason</Ariakit.DialogDismiss>
        </Ariakit.Dialog>
      </Ariakit.Dialog>
    </>
  );
}
