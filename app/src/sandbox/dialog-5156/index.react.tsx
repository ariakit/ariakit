import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";

// TODO: Remove once https://github.com/ariakit/ariakit/issues/5156 is fixed.
// While a dialog is open, Ariakit's interact-outside listeners assume that
// `event.target` is a DOM node. Some third-party code dispatches events whose
// target is a non-Node EventTarget, which makes Ariakit call `contains()` on
// it and throw. Registering this capture-phase guard before any dialog opens
// lets us stop those events before they reach Ariakit's own (later-registered)
// capture listeners on the document.
function useIgnoreNonNodeEvents() {
  useEffect(() => {
    const types = ["click", "focusin", "contextmenu"];
    const onEvent = (event: Event) => {
      if (event.target && !(event.target instanceof Node)) {
        event.stopImmediatePropagation();
      }
    };
    for (const type of types) {
      document.addEventListener(type, onEvent, true);
    }
    return () => {
      for (const type of types) {
        document.removeEventListener(type, onEvent, true);
      }
    };
  }, []);
}

export default function Example() {
  useIgnoreNonNodeEvents();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Ariakit.Button onClick={() => setOpen(true)} className="px-2 py-1">
        Show dialog
      </Ariakit.Button>
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
