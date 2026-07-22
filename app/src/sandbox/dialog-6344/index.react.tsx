import * as Ariakit from "@ariakit/react";
import { useRef, useState } from "react";

// Reproduces a non-modal dialog with getPersistentElements closing when the
// user interacts with a persistent element before the dialog has been focused.
// To see the bug:
//   1. Click "Open dialog". The panel opens without taking focus
//      (autoFocusOnShow={false}).
//   2. Without clicking inside the dialog, click (or focus, or right-click) the
//      "Notification field" input inside the persistent "Notifications" region.
//   3. The dialog closes, even though the region is returned by
//      getPersistentElements and should be treated as part of the dialog.
// For contrast, focusing "Inside field" first makes the same interaction keep
// the dialog open, as documented.
export default function Example() {
  const [open, setOpen] = useState(false);
  const [alternate, setAlternate] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col items-start gap-3">
      <Ariakit.Button
        className="rounded bg-blue-600 px-3 py-1 text-white"
        onClick={() => setOpen(true)}
      >
        Open dialog
      </Ariakit.Button>

      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        autoFocusOnShow={false}
        getPersistentElements={() => {
          const notifications = notificationsRef.current;
          return notifications ? [notifications] : [];
        }}
        render={alternate ? <section /> : <div />}
        className="flex w-72 flex-col items-start gap-3 rounded-lg border border-gray-300 bg-white p-4 shadow-lg"
      >
        <Ariakit.DialogHeading className="text-lg font-medium">
          Dialog
        </Ariakit.DialogHeading>
        <input
          aria-label="Inside field"
          placeholder="Inside field"
          className="rounded border border-gray-300 px-3 py-1"
        />
        <Ariakit.DialogDismiss className="rounded border border-gray-300 px-3 py-1">
          Close dialog
        </Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      {/* Persistent notifications region, like the dialog-react-toastify
          example. Interacting with it must never close the dialog. */}
      <div
        ref={notificationsRef}
        role="region"
        aria-label="Notifications"
        className="flex flex-col items-start gap-3 rounded-lg border border-gray-300 p-4"
      >
        <input
          aria-label="Notification field"
          placeholder="Notification field"
          className="rounded border border-gray-300 px-3 py-1"
        />
        <button
          type="button"
          onClick={() => setAlternate((value) => !value)}
          className="rounded border border-gray-300 px-3 py-1"
        >
          Replace dialog node
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 px-3 py-1"
        >
          Dismiss notification
        </button>
      </div>

      {/* A regular outside element: interacting with it must still close the
          dialog. */}
      <input
        aria-label="Outside field"
        placeholder="Outside field"
        className="rounded border border-gray-300 px-3 py-1"
      />
    </div>
  );
}
