import * as Ariakit from "@ariakit/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function createThirdPartyPortal(doc: Document) {
  const portal = doc.createElement("div");
  portal.dataset.thirdPartyPortal = "";
  return portal;
}

export default function Example() {
  const [orangesOpen, setOrangesOpen] = useState(true);
  const [applesOpen, setApplesOpen] = useState(true);
  const [orangesPortal, setOrangesPortal] = useState(true);
  const [applesPortal, setApplesPortal] = useState(true);
  const [orangesCustomPortal, setOrangesCustomPortal] = useState(false);
  const [orangesEaten, setOrangesEaten] = useState(0);
  const [applesEaten, setApplesEaten] = useState(0);
  const [replaceApplesBackdrop, setReplaceApplesBackdrop] = useState(false);
  const [replaceOrangesDialog, setReplaceOrangesDialog] = useState(false);
  const [thirdPartyPortal, setThirdPartyPortal] = useState<HTMLElement | null>(
    null,
  );
  const [thirdPartyInteractions, setThirdPartyInteractions] = useState(0);
  const fullscreenHostRef = useRef<HTMLDivElement>(null);
  const getCustomPortal = useCallback((dialog: HTMLElement) => {
    const portal = dialog.ownerDocument.createElement("div");
    portal.dataset.customPortal = "";
    return portal;
  }, []);

  useEffect(() => {
    if (!thirdPartyPortal) return;
    thirdPartyPortal.ownerDocument.body.append(thirdPartyPortal);
    return () => thirdPartyPortal.remove();
  }, [thirdPartyPortal]);

  return (
    <>
      <div ref={fullscreenHostRef} data-fullscreen-host="" />
      <button
        type="button"
        onClick={() => {
          setOrangesCustomPortal(false);
          setOrangesPortal(false);
          setApplesPortal(false);
          setOrangesOpen(true);
          setApplesOpen(false);
        }}
      >
        Open inline orange dialog
      </button>

      <Ariakit.Dialog
        open={orangesOpen}
        onClose={() => setOrangesOpen(false)}
        portal={orangesPortal}
        portalElement={orangesCustomPortal ? getCustomPortal : undefined}
        render={
          replaceOrangesDialog ? (
            <div key="replacement" data-replacement-dialog="" />
          ) : (
            <div key="initial" />
          )
        }
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
        <button type="button" onClick={() => setApplesOpen(true)}>
          Open apples
        </button>
        <button
          type="button"
          onClick={(event) => {
            setThirdPartyPortal(
              createThirdPartyPortal(event.currentTarget.ownerDocument),
            );
          }}
        >
          Open third-party dialog
        </button>
        <button
          type="button"
          onClick={() => {
            void fullscreenHostRef.current?.requestFullscreen();
          }}
        >
          Enter fullscreen
        </button>
        <Ariakit.DialogDismiss className="rounded border border-gray-300 px-3 py-1">
          Close oranges
        </Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      <Ariakit.Dialog
        open={applesOpen}
        onClose={() => setApplesOpen(false)}
        portal={applesPortal}
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
        <button type="button" onClick={() => setOrangesOpen((open) => !open)}>
          {orangesOpen ? "Hide orange dialog" : "Show orange dialog"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOrangesOpen(false);
            setApplesOpen(false);
          }}
        >
          Close both dialogs
        </button>
        <button type="button" onClick={() => setOrangesPortal(true)}>
          Move orange dialog to portal
        </button>
        <button
          type="button"
          onClick={() => {
            setOrangesCustomPortal(true);
            setOrangesPortal(true);
          }}
        >
          Move orange dialog to custom portal
        </button>
        <Ariakit.DialogDismiss className="rounded border border-gray-300 px-3 py-1">
          Close apples
        </Ariakit.DialogDismiss>
      </Ariakit.Dialog>

      {thirdPartyPortal &&
        createPortal(
          <div role="dialog" aria-label="Third-party">
            <button type="button" onClick={() => setApplesOpen(true)}>
              Open apples from third-party
            </button>
            <button
              type="button"
              onClick={() => setThirdPartyInteractions((count) => count + 1)}
            >
              Interact with third-party
            </button>
            <div role="status" aria-label="Third-party count">
              Third-party interactions: {thirdPartyInteractions}
            </div>
          </div>,
          thirdPartyPortal,
        )}
    </>
  );
}
