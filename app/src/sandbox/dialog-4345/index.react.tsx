import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/4345: the page opts
// into an always-visible scrollbar with an inline overflow-y: scroll on the
// html element (a common anti-layout-shift technique). Opening a modal dialog
// must not shift the layout, must still lock the page scroll (the page
// scrolls through the html element, so hiding the body overflow alone has no
// effect), and closing it must leave the html inline style exactly as it was.
export default function Example() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const { style } = document.documentElement;
    const previousOverflowY = style.getPropertyValue("overflow-y");
    style.setProperty("overflow-y", "scroll");
    return () => {
      if (previousOverflowY) {
        style.setProperty("overflow-y", previousOverflowY);
      } else {
        style.removeProperty("overflow-y");
      }
    };
  }, []);

  return (
    <div className="flex min-h-[200vh] flex-col items-start gap-3">
      <Ariakit.Button
        className="sticky top-3 rounded bg-blue-600 px-3 py-1 text-white"
        onClick={() => setOpen(true)}
      >
        Show modal
      </Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="fixed inset-3 m-auto flex h-fit w-72 flex-col items-start gap-3 rounded-lg border border-gray-300 bg-white p-4 shadow-lg"
      >
        <Ariakit.DialogHeading className="text-lg font-medium">
          Dialog
        </Ariakit.DialogHeading>
        <p>The page behind this modal must not scroll.</p>
        <Ariakit.DialogDismiss className="rounded bg-blue-600 px-3 py-1 text-white">
          Close
        </Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </div>
  );
}
