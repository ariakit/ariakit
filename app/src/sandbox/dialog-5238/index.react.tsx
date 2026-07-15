import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [orangesOpen, setOrangesOpen] = useState(true);
  const [applesOpen, setApplesOpen] = useState(true);
  const [orangesEaten, setOrangesEaten] = useState(0);
  const [applesEaten, setApplesEaten] = useState(0);
  const [replaceApplesBackdrop, setReplaceApplesBackdrop] = useState(false);
  const [replaceOrangesDialog, setReplaceOrangesDialog] = useState(false);

  return (
    <>
      <Ariakit.Dialog
        open={orangesOpen}
        onClose={() => setOrangesOpen(false)}
        render={
          replaceOrangesDialog ? (
            <div key="replacement" data-replacement-dialog="" />
          ) : (
            <div key="initial" />
          )
        }
        unmountOnHide
        className="fixed inset-3 m-auto flex h-fit w-72 flex-col items-start gap-3 rounded-lg border border-gray-300 bg-white p-4 shadow-lg"
      >
        <Ariakit.DialogHeading className="text-lg font-medium">
          Oranges
        </Ariakit.DialogHeading>
        <button
          type="button"
          className="rounded bg-orange-600 px-3 py-1 text-white"
          onClick={() => setOrangesEaten((count) => count + 1)}
        >
          Eat orange
        </button>
        <div role="status" aria-label="Orange count">
          Oranges eaten: {orangesEaten}
        </div>
        <Ariakit.DialogDismiss className="rounded border border-gray-300 px-3 py-1">
          Close oranges
        </Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      <Ariakit.Dialog
        open={applesOpen}
        onClose={() => setApplesOpen(false)}
        backdrop={
          replaceApplesBackdrop ? (
            <div key="replacement" data-replacement-backdrop="" />
          ) : (
            true
          )
        }
        unmountOnHide
        className="fixed inset-3 m-auto flex h-fit w-72 translate-x-6 translate-y-6 flex-col items-start gap-3 rounded-lg border border-gray-300 bg-white p-4 shadow-lg"
      >
        <Ariakit.DialogHeading className="text-lg font-medium">
          Apples
        </Ariakit.DialogHeading>
        <button
          type="button"
          className="rounded bg-red-600 px-3 py-1 text-white"
          onClick={() => setApplesEaten((count) => count + 1)}
        >
          Eat apple
        </button>
        <div role="status" aria-label="Apple count">
          Apples eaten: {applesEaten}
        </div>
        <button type="button" onClick={() => setReplaceApplesBackdrop(true)}>
          Replace apple backdrop
        </button>
        <button type="button" onClick={() => setReplaceOrangesDialog(true)}>
          Replace orange dialog
        </button>
        <Ariakit.DialogDismiss className="rounded border border-gray-300 px-3 py-1">
          Close apples
        </Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </>
  );
}
