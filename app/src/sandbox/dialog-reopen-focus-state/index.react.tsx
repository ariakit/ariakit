import * as Ariakit from "@ariakit/react";
import { useEffect, useRef, useState } from "react";

// Reproduces a dialog that fails to close when, after being reopened, focus
// lands on freshly added outside content (an async-loaded panel, a toast, etc.).
// To see the bug:
//   1. Open the dialog and focus the field inside it (this marks the dialog as
//      interacted-with).
//   2. Close it, then open it again.
//   3. Click "Reveal outside field": a new field appears outside and takes
//      focus. The dialog should close, because focus moved outside without you
//      interacting with the dialog this time.
// Before the fix the dialog stayed open, because the "was focused inside" flag
// was not reset when the dialog reopened.
export default function Example() {
  const [open, setOpen] = useState(false);
  const [showField, setShowField] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);

  // Focus the field as soon as it appears, simulating outside content that grabs
  // focus while the dialog is open.
  useEffect(() => {
    if (!showField) return;
    fieldRef.current?.focus();
  }, [showField]);

  return (
    <div className="flex flex-col items-start gap-3">
      {/* Interacting with these controls must not close the dialog, so they are
          exempted from hideOnInteractOutside below. */}
      <div ref={controlsRef} className="flex flex-col items-start gap-3">
        <Ariakit.Button
          className="rounded bg-blue-600 px-3 py-1 text-white"
          onClick={() => {
            // Start every open without the field so revealing it counts as a
            // brand-new node, added after the dialog marked the outside tree.
            setShowField(false);
            setOpen(true);
          }}
        >
          Open dialog
        </Ariakit.Button>
        <button
          type="button"
          className="rounded border border-gray-300 px-3 py-1"
          onClick={() => setShowField(true)}
        >
          Reveal outside field
        </button>
      </div>

      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        unmountOnHide={false}
        autoFocusOnShow={false}
        autoFocusOnHide={false}
        hideOnInteractOutside={(event) =>
          !controlsRef.current?.contains(event.target as Node)
        }
        className="flex w-72 flex-col items-start gap-3 rounded-lg border border-gray-300 bg-white p-4 shadow-lg"
      >
        <Ariakit.DialogHeading className="text-lg font-medium">
          Dialog
        </Ariakit.DialogHeading>
        {/* A text field, not a button: clicking a native button does not move
            focus on Safari/Firefox, but a text input focuses on click in every
            browser, so the dialog reliably registers as focused-inside. */}
        <input
          aria-label="Inside field"
          placeholder="Inside field"
          className="rounded border border-gray-300 px-3 py-1"
        />
        <Ariakit.DialogDismiss className="rounded border border-gray-300 px-3 py-1">
          Close dialog
        </Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      {showField && (
        <input
          ref={fieldRef}
          aria-label="Dynamic outside field"
          placeholder="Dynamic outside field"
          className="rounded border border-gray-300 px-3 py-1"
        />
      )}
    </div>
  );
}
