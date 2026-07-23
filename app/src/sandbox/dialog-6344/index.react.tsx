import * as Ariakit from "@ariakit/react";
import { useCallback, useRef, useState } from "react";

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
  const [showShadowDialog, setShowShadowDialog] = useState(false);
  const [shadowDialogPortal, setShadowDialogPortal] =
    useState<HTMLElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const shadowPersistentRef = useRef<HTMLDivElement>(null);
  const shadowFocusCleanupRef = useRef<(() => void) | null>(null);
  const setShadowHost = useCallback((host: HTMLDivElement | null) => {
    shadowFocusCleanupRef.current?.();
    shadowFocusCleanupRef.current = null;
    if (!host) return;
    const shadowRoot = host.shadowRoot || host.attachShadow({ mode: "open" });
    let persistentRegion = shadowRoot.querySelector<HTMLDivElement>(
      "[data-persistent-shadow-region]",
    );
    if (!persistentRegion) {
      persistentRegion = host.ownerDocument.createElement("div");
      persistentRegion.dataset.persistentShadowRegion = "";

      const persistentHost = host.ownerDocument.createElement("div");
      persistentHost.dataset.persistentShadowHost = "";
      const persistentRoot = persistentHost.attachShadow({ mode: "open" });

      const persistentInput = host.ownerDocument.createElement("input");
      persistentInput.dataset.persistentShadowField = "";
      persistentInput.setAttribute("aria-label", "Persistent shadow field");
      persistentInput.setAttribute("placeholder", "Persistent shadow field");

      const persistentButton = host.ownerDocument.createElement("button");
      persistentButton.dataset.persistentShadowButton = "";
      persistentButton.textContent = "Persistent shadow button";
      persistentButton.addEventListener("mousedown", (event) => {
        event.preventDefault();
      });

      persistentRoot.append(persistentInput, persistentButton);
      persistentRegion.append(persistentHost);

      const outsideInput = host.ownerDocument.createElement("input");
      outsideInput.dataset.outsideShadowField = "";
      outsideInput.setAttribute("aria-label", "Outside shadow field");
      outsideInput.setAttribute("placeholder", "Outside shadow field");

      const outsideButton = host.ownerDocument.createElement("button");
      outsideButton.dataset.outsideShadowButton = "";
      outsideButton.textContent = "Outside shadow button";
      outsideButton.addEventListener("mousedown", (event) => {
        event.preventDefault();
      });

      const disconnectedInput = host.ownerDocument.createElement("input");
      disconnectedInput.dataset.disconnectedShadowField = "";
      disconnectedInput.setAttribute("aria-label", "Disconnected shadow field");
      disconnectedInput.setAttribute(
        "placeholder",
        "Disconnected shadow field",
      );

      const dialogPortal = host.ownerDocument.createElement("div");
      dialogPortal.dataset.shadowDialogPortal = "";

      shadowRoot.append(
        persistentRegion,
        outsideInput,
        outsideButton,
        disconnectedInput,
        dialogPortal,
      );
    }
    shadowPersistentRef.current = persistentRegion;

    const dialogPortal = shadowRoot.querySelector<HTMLElement>(
      "[data-shadow-dialog-portal]",
    );
    setShadowDialogPortal(dialogPortal);

    const disconnectedInput = shadowRoot.querySelector<HTMLInputElement>(
      "[data-disconnected-shadow-field]",
    );
    if (!disconnectedInput) return;
    const doc = host.ownerDocument;
    const disconnectFocusedElement = (event: FocusEvent) => {
      if (event.composedPath()[0] !== disconnectedInput) return;
      disconnectedInput.remove();
    };
    doc.addEventListener("focusin", disconnectFocusedElement, true);
    shadowFocusCleanupRef.current = () => {
      doc.removeEventListener("focusin", disconnectFocusedElement, true);
    };
  }, []);

  return (
    <div className="flex flex-col items-start gap-3">
      <Ariakit.Button
        className="rounded bg-blue-600 px-3 py-1 text-white"
        onClick={() => setOpen(true)}
      >
        Open dialog
      </Ariakit.Button>

      <Ariakit.Button onClick={() => setShowShadowDialog(true)}>
        Show shadow dialog
      </Ariakit.Button>

      <Ariakit.Dialog
        id="dialog"
        open={open}
        onClose={() => setOpen(false)}
        modal={false}
        autoFocusOnShow={false}
        getPersistentElements={() => {
          const persistentElements: Element[] = [];
          const notifications = notificationsRef.current;
          if (notifications) persistentElements.push(notifications);
          const shadowPersistent = shadowPersistentRef.current;
          if (shadowPersistent) persistentElements.push(shadowPersistent);
          return persistentElements;
        }}
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

      <div ref={setShadowHost} data-testid="shadow-host" />

      {shadowDialogPortal && showShadowDialog && (
        <Ariakit.Portal portalElement={shadowDialogPortal}>
          <Ariakit.Dialog
            id="dialog"
            aria-label="Shadow dialog"
            open
            modal={false}
            autoFocusOnShow={false}
            hideOnInteractOutside={false}
          >
            <input
              aria-label="Shadow dialog field"
              placeholder="Shadow dialog field"
            />
          </Ariakit.Dialog>
        </Ariakit.Portal>
      )}
    </div>
  );
}
