import * as Ariakit from "@ariakit/react";
import * as React from "react";

type ActivityMode = "hidden" | "visible";

interface ActivityBoundaryProps {
  children: React.ReactNode;
  mode: ActivityMode;
}

function ActivityBoundary({ children, mode }: ActivityBoundaryProps) {
  if (!("Activity" in React)) {
    return children;
  }
  return <React.Activity mode={mode}>{children}</React.Activity>;
}

function ExampleContent() {
  const [open, setOpen] = React.useState(false);
  const [activityMode, setActivityMode] =
    React.useState<ActivityMode>("visible");
  const [dialogKey, setDialogKey] = React.useState(0);
  const [closeWhileHidden, setCloseWhileHidden] = React.useState(false);
  const [autoFocusEnabled, setAutoFocusEnabled] = React.useState(true);
  const [finalFocusDisabled, setFinalFocusDisabled] = React.useState(false);
  const [reopenAfterClose, setReopenAfterClose] = React.useState(false);
  const [replaceOnReopen, setReplaceOnReopen] = React.useState(false);
  const [closeAfterReopen, setCloseAfterReopen] = React.useState(false);
  const [portal, setPortal] = React.useState(false);
  const [restoreFocus, setRestoreFocus] = React.useState(true);
  const [useFinalFocus, setUseFinalFocus] = React.useState(true);
  const [callbackName, setCallbackName] = React.useState<"first" | "second">(
    "first",
  );
  const [callbackLog, setCallbackLog] = React.useState("none");
  const finalFocusRef = React.useRef<HTMLButtonElement>(null);

  const autoFocusOnHide = React.useCallback(() => {
    setCallbackLog((log) =>
      log === "none" ? callbackName : `${log}, ${callbackName}`,
    );
    return restoreFocus;
  }, [callbackName, restoreFocus]);

  React.useEffect(() => {
    if (!closeWhileHidden) return;
    if (activityMode !== "hidden") return;
    if (callbackLog === "none") return;
    setOpen(false);
    setActivityMode("visible");
    setCloseWhileHidden(false);
  }, [activityMode, callbackLog, closeWhileHidden]);

  React.useLayoutEffect(() => {
    if (!reopenAfterClose) return;
    if (open) return;
    setFinalFocusDisabled(false);
    if (replaceOnReopen) {
      setDialogKey((key) => key + 1);
      setReplaceOnReopen(false);
    }
    setOpen(true);
    setReopenAfterClose(false);
  }, [open, reopenAfterClose, replaceOnReopen]);

  React.useLayoutEffect(() => {
    if (!closeAfterReopen) return;
    if (!open) return;
    if (reopenAfterClose) return;
    setOpen(false);
    setCloseAfterReopen(false);
  }, [closeAfterReopen, open, reopenAfterClose]);

  return (
    <div className="flex flex-col items-start gap-3">
      <Ariakit.Button
        ref={finalFocusRef}
        disabled={finalFocusDisabled}
        className="rounded bg-blue-600 px-3 py-1 text-white"
        onClick={() => {
          setActivityMode("visible");
          setPortal(false);
          setUseFinalFocus(true);
          setOpen(true);
        }}
      >
        Open dialog
      </Ariakit.Button>
      <Ariakit.Button
        className="rounded border border-gray-300 px-3 py-1"
        onClick={() => {
          setActivityMode("visible");
          setPortal(false);
          setUseFinalFocus(false);
          setOpen(true);
        }}
      >
        Open dialog without final focus
      </Ariakit.Button>
      <Ariakit.Button
        className="rounded border border-gray-300 px-3 py-1"
        onClick={() => {
          setActivityMode("visible");
          setPortal(true);
          setUseFinalFocus(false);
          setOpen(true);
        }}
      >
        Open portaled dialog without final focus
      </Ariakit.Button>
      <ActivityBoundary mode={activityMode}>
        <Ariakit.Dialog
          key={dialogKey}
          open={open}
          onClose={() => setOpen(false)}
          modal={false}
          portal={portal}
          autoFocusOnShow={false}
          hideOnInteractOutside={false}
          finalFocus={useFinalFocus ? finalFocusRef : undefined}
          autoFocusOnHide={autoFocusEnabled ? autoFocusOnHide : false}
          className="flex w-72 flex-col items-start gap-3 rounded-lg border border-gray-300 bg-white p-4 shadow-lg"
        >
          <Ariakit.DialogHeading className="text-lg font-medium">
            Dialog
          </Ariakit.DialogHeading>
          <button
            type="button"
            className="rounded border border-gray-300 px-3 py-1"
            onClick={() => setCallbackName("second")}
          >
            Use second callback
          </button>
          <button
            type="button"
            className="rounded border border-gray-300 px-3 py-1"
            onClick={() => setRestoreFocus(false)}
          >
            Prevent focus restoration
          </button>
          <button
            type="button"
            className="rounded border border-gray-300 px-3 py-1"
            onClick={() => setAutoFocusEnabled(false)}
          >
            Disable focus restoration
          </button>
          <button
            type="button"
            className="rounded border border-gray-300 px-3 py-1"
            onClick={() => setDialogKey((key) => key + 1)}
          >
            Remount dialog
          </button>
          <button
            type="button"
            className="rounded border border-gray-300 px-3 py-1"
            onClick={() => {
              setFinalFocusDisabled(true);
              setReopenAfterClose(true);
              setOpen(false);
            }}
          >
            Close and reopen dialog
          </button>
          <button
            type="button"
            className="rounded border border-gray-300 px-3 py-1"
            onClick={() => {
              setFinalFocusDisabled(true);
              setReopenAfterClose(true);
              setReplaceOnReopen(true);
              setCloseAfterReopen(true);
              setOpen(false);
            }}
          >
            Close replacement before retry
          </button>
          <Ariakit.DialogDismiss className="rounded border border-gray-300 px-3 py-1">
            Close dialog
          </Ariakit.DialogDismiss>
          <button
            type="button"
            className="rounded border border-gray-300 px-3 py-1"
            onClick={() => setActivityMode("hidden")}
          >
            Hide activity
          </button>
          <button
            type="button"
            className="rounded border border-gray-300 px-3 py-1"
            onClick={() => {
              setCloseWhileHidden(true);
              setActivityMode("hidden");
            }}
          >
            Hide, close, and show activity
          </button>
        </Ariakit.Dialog>
      </ActivityBoundary>
      <output aria-label="Focus callbacks">{callbackLog}</output>
      <output aria-label="Dialog state">
        {activityMode}, {open ? "open" : "closed"}
      </output>
    </div>
  );
}

export default function Example() {
  return (
    <React.StrictMode>
      <ExampleContent />
    </React.StrictMode>
  );
}
