import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  // Form state lifted to the parent, so every keystroke re-renders Example.
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  // TODO: Remove this workaround once
  // https://github.com/ariakit/ariakit/issues/6322 is fixed. Memoizing the
  // portalRef keeps its identity stable across re-renders so the portal node
  // is not destroyed and recreated on every keystroke.
  const dialogPortalRef = useCallback((portalNode: HTMLElement | null) => {
    portalNode?.classList.add("dialog-portal");
  }, []);

  const notesPortalRef = useCallback((portalNode: HTMLElement | null) => {
    portalNode?.classList.add("notes-portal");
  }, []);

  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)} className="px-2 py-1">
        Open dialog
      </Ariakit.Button>

      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        portalRef={dialogPortalRef}
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

      <Ariakit.Portal portalRef={notesPortalRef}>
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
