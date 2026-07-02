import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  // Form state lifted to the parent, so every keystroke re-renders Example and
  // creates new inline portalRef callbacks below.
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)} className="px-2 py-1">
        Open dialog
      </Ariakit.Button>

      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        // Inline portalRef: new function identity on every render.
        portalRef={(portalNode) => {
          portalNode?.classList.add("dialog-portal");
        }}
        className="fixed inset-12 z-50 flex flex-col items-start gap-4 rounded-lg bg-white p-4 text-black"
      >
        <Ariakit.DialogHeading className="text-xl font-semibold">
          Profile
        </Ariakit.DialogHeading>
        <Ariakit.DialogDismiss className="px-2 py-1">
          Close
        </Ariakit.DialogDismiss>
        <input
          aria-label="Name"
          className="rounded border border-gray-300 p-1"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Ariakit.Dialog>

      <Ariakit.Portal
        portalRef={(portalNode) => {
          portalNode?.classList.add("notes-portal");
        }}
      >
        <input
          aria-label="Notes"
          className="rounded border border-gray-300 p-1"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </Ariakit.Portal>
    </>
  );
}
