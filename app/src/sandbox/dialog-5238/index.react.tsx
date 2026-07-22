import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [orangesOpen, setOrangesOpen] = useState(true);
  const [applesOpen, setApplesOpen] = useState(true);
  const [orangesEaten, setOrangesEaten] = useState(0);
  const [applesEaten, setApplesEaten] = useState(0);
  const [treeSnapshotKey, setTreeSnapshotKey] = useState(0);

  return (
    <>
      <Ariakit.Dialog
        open={orangesOpen}
        onClose={() => setOrangesOpen(false)}
        autoFocusOnShow={false}
        unmountOnHide
        unstable_treeSnapshotKey={treeSnapshotKey}
        backdrop={<div data-testid="oranges-backdrop" />}
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
        unmountOnHide
        backdrop={<div data-testid="apples-backdrop" />}
        className="fixed inset-3 m-auto flex h-fit w-72 translate-x-6 translate-y-6 flex-col items-start gap-3 rounded-lg border border-gray-300 bg-white p-4 shadow-lg"
      >
        <Ariakit.DialogHeading className="text-lg font-medium">
          Apples
        </Ariakit.DialogHeading>
        <button
          type="button"
          className="rounded bg-red-600 px-3 py-1 text-white"
          onClick={() => {
            setApplesEaten((count) => count + 1);
            setTreeSnapshotKey((key) => key + 1);
          }}
        >
          Eat apple
        </button>
        <div role="status" aria-label="Apple count">
          Apples eaten: {applesEaten}
        </div>
        <Ariakit.DialogDismiss className="rounded border border-gray-300 px-3 py-1">
          Close apples
        </Ariakit.DialogDismiss>
      </Ariakit.Dialog>
    </>
  );
}
