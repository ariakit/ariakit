import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";

interface DialogsProps {
  hideOnInteractOutside?: boolean;
  onRenderInShadowRoot?: () => void;
}

function Dialogs({
  hideOnInteractOutside,
  onRenderInShadowRoot,
}: DialogsProps) {
  const [orangesOpen, setOrangesOpen] = useState(true);
  const [applesOpen, setApplesOpen] = useState(true);
  const [orangesEaten, setOrangesEaten] = useState(0);
  const [applesEaten, setApplesEaten] = useState(0);
  const [treeSnapshotKey, setTreeSnapshotKey] = useState(0);

  return (
    <>
      <Ariakit.Dialog
        aria-label="Oranges"
        open={orangesOpen}
        onClose={() => setOrangesOpen(false)}
        autoFocusOnShow={false}
        hideOnInteractOutside={hideOnInteractOutside}
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
        aria-label="Apples"
        open={applesOpen}
        onClose={() => setApplesOpen(false)}
        hideOnInteractOutside={hideOnInteractOutside}
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
        {onRenderInShadowRoot && (
          <button type="button" onClick={onRenderInShadowRoot}>
            Render dialogs in shadow root
          </button>
        )}
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

function ShadowDialogs() {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);
  const setHost = useCallback((host: HTMLDivElement | null) => {
    if (!host) return;
    const shadowRoot = host.shadowRoot || host.attachShadow({ mode: "open" });
    const existingPortal = shadowRoot.querySelector<HTMLElement>(
      "[data-dialog-shadow-portal]",
    );
    if (existingPortal) {
      setPortalElement(existingPortal);
      return;
    }
    const portalElement = host.ownerDocument.createElement("div");
    portalElement.dataset.dialogShadowPortal = "";
    shadowRoot.append(portalElement);
    setPortalElement(portalElement);
  }, []);

  return (
    <>
      <div ref={setHost} data-testid="dialog-shadow-host" />
      {portalElement && (
        <Ariakit.Portal portalElement={portalElement}>
          <Dialogs hideOnInteractOutside={false} />
        </Ariakit.Portal>
      )}
    </>
  );
}

export default function Example() {
  const [renderInShadowRoot, setRenderInShadowRoot] = useState(false);

  if (renderInShadowRoot) return <ShadowDialogs />;

  return <Dialogs onRenderInShadowRoot={() => setRenderInShadowRoot(true)} />;
}
