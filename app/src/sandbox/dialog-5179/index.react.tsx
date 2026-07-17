import * as Ariakit from "@ariakit/react";
import type { KeyboardEvent, ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";

function ReactPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

interface AutocompleteProps {
  capture?: boolean;
  preventDefault?: boolean;
}

function Autocomplete({ capture, preventDefault }: AutocompleteProps) {
  const [open, setOpen] = useState(true);
  const inputId = useId();
  const listboxId = useId();
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return;
    if (!open) return;
    if (preventDefault) {
      event.preventDefault();
    } else {
      event.stopPropagation();
    }
    setOpen(false);
  };

  return (
    <div>
      <label htmlFor={inputId}>Search</label>
      <input
        id={inputId}
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-autocomplete="list"
        onKeyDown={capture ? undefined : onKeyDown}
        onKeyDownCapture={capture ? onKeyDown : undefined}
      />
      {open && (
        <div id={listboxId} role="listbox" aria-label="Suggestions">
          <div role="option" aria-selected="false">
            Ariakit
          </div>
        </div>
      )}
    </div>
  );
}

interface DialogExampleProps {
  capture?: boolean;
  modal?: boolean;
  name?: string;
  portal?: boolean;
  portalChild?: "ariakit" | "react";
  preventDefault?: boolean;
  stopDialogOnEscape?: boolean;
  stopDialogOnEscapeCapture?: boolean;
  stopOnEscape?: boolean;
  stopOnEscapeCapture?: boolean;
}

function DialogExample({
  capture,
  modal,
  name = "Dialog",
  portal,
  portalChild,
  preventDefault,
  stopDialogOnEscape,
  stopDialogOnEscapeCapture,
  stopOnEscape,
  stopOnEscapeCapture,
}: DialogExampleProps) {
  const [open, setOpen] = useState(false);
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
  };
  const autocomplete = (
    <Autocomplete capture={capture} preventDefault={preventDefault} />
  );
  const dialog = (
    <Ariakit.DialogProvider open={open} setOpen={setOpen}>
      <Ariakit.DialogDisclosure>
        Open {name.toLowerCase()}
      </Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        modal={modal}
        portal={portal}
        hideOnInteractOutside={portalChild ? false : undefined}
        onKeyDown={stopDialogOnEscape ? onKeyDown : undefined}
        onKeyDownCapture={stopDialogOnEscapeCapture ? onKeyDown : undefined}
      >
        <Ariakit.DialogHeading>{name}</Ariakit.DialogHeading>
        {!open && portalChild ? null : portalChild === "ariakit" ? (
          <Ariakit.Portal>{autocomplete}</Ariakit.Portal>
        ) : portalChild === "react" ? (
          <ReactPortal>{autocomplete}</ReactPortal>
        ) : (
          autocomplete
        )}
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  );
  if (!stopOnEscape && !stopOnEscapeCapture) return dialog;
  return (
    <div
      onKeyDown={stopOnEscape ? onKeyDown : undefined}
      onKeyDownCapture={stopOnEscapeCapture ? onKeyDown : undefined}
    >
      {dialog}
    </div>
  );
}

interface ThirdPartyDialogExampleProps {
  capture?: boolean;
}

function ThirdPartyDialogExample({ capture }: ThirdPartyDialogExampleProps) {
  const [open, setOpen] = useState(false);
  const name = capture ? "Capture third-party dialog" : "Third-party dialog";
  const nestedName = capture
    ? "Shielded Ariakit dialog"
    : "Nested Ariakit dialog";
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    setOpen(false);
  };
  if (!open) {
    return (
      <button onClick={() => setOpen(true)}>Open {name.toLowerCase()}</button>
    );
  }
  return (
    <div
      role="dialog"
      aria-label={name}
      onKeyDown={capture ? undefined : onKeyDown}
      onKeyDownCapture={capture ? onKeyDown : undefined}
    >
      <Ariakit.DialogProvider>
        <Ariakit.DialogDisclosure>
          Open {nestedName.toLowerCase()}
        </Ariakit.DialogDisclosure>
        <Ariakit.Dialog
          modal={false}
          hideOnEscape={
            capture
              ? (event) => {
                  event.stopPropagation();
                  return true;
                }
              : undefined
          }
        >
          <Ariakit.DialogHeading>{nestedName}</Ariakit.DialogHeading>
          <button>Inside {nestedName.toLowerCase()}</button>
        </Ariakit.Dialog>
      </Ariakit.DialogProvider>
    </div>
  );
}

interface HideOnEscapeExampleProps {
  accept?: boolean;
  name: string;
  portalChild?: boolean;
  preventDefault?: boolean;
  stop?: boolean;
}

function HideOnEscapeExample({
  accept,
  name,
  portalChild,
  preventDefault,
  stop,
}: HideOnEscapeExampleProps) {
  const [calls, setCalls] = useState(0);
  const content = <button>Callback calls: {calls}</button>;
  return (
    <Ariakit.DialogProvider>
      <Ariakit.DialogDisclosure>
        Open {name.toLowerCase()}
      </Ariakit.DialogDisclosure>
      <Ariakit.Dialog
        modal={false}
        hideOnInteractOutside={portalChild ? false : undefined}
        hideOnEscape={(event) => {
          setCalls((calls) => calls + 1);
          if (preventDefault) event.preventDefault();
          if (stop) event.stopPropagation();
          return accept ?? !!stop;
        }}
      >
        <Ariakit.DialogHeading>{name}</Ariakit.DialogHeading>
        {portalChild ? <ReactPortal>{content}</ReactPortal> : content}
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  );
}

export function DocumentRootDocument() {
  return (
    <html>
      <head />
      <body>
        <DialogExample name="Document root dialog" portal={false} />
        <DialogExample
          capture
          name="Document root capture dialog"
          portal={false}
        />
        <DialogExample
          name="Document root prevented dialog"
          portal={false}
          preventDefault
        />
        <DialogExample
          name="Document root own bubble dialog"
          portal={false}
          stopDialogOnEscape
        />
        <DialogExample
          name="Document root own capture dialog"
          portal={false}
          stopDialogOnEscapeCapture
        />
        <DialogExample
          modal={false}
          name="Document root global dialog"
          portal={false}
        />
        <DialogExample
          modal={false}
          name="Document root outside dialog"
          portal={false}
          stopOnEscapeCapture
        />
        <HideOnEscapeExample name="Document root callback dialog" stop />
      </body>
    </html>
  );
}

function DocumentRootExample() {
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const document = iframe?.contentDocument;
    if (!document) return;
    // Delegate React events to the document itself to reproduce the listener
    // ordering where React capture runs before the Dialog effect.
    const root = createRoot(document);
    root.render(<DocumentRootDocument />);
    return () => root.unmount();
  }, [iframe]);

  return <iframe ref={setIframe} title="Document root example" />;
}

export default function Example() {
  const [showDocumentRoot, setShowDocumentRoot] = useState(false);
  return (
    <>
      <DialogExample />
      <DialogExample name="Outer ancestor dialog" portal={false} stopOnEscape />
      <DialogExample
        name="Outer capture dialog"
        portal={false}
        stopOnEscapeCapture
      />
      <DialogExample name="Own bubble dialog" stopDialogOnEscape />
      <DialogExample name="Own capture dialog" stopDialogOnEscapeCapture />
      <DialogExample modal={false} name="Outside dialog" />
      <DialogExample
        modal={false}
        name="Ariakit Portal child dialog"
        portal={false}
        portalChild="ariakit"
      />
      <DialogExample
        modal={false}
        name="React portal child dialog"
        portal={false}
        portalChild="react"
      />
      <ThirdPartyDialogExample />
      <ThirdPartyDialogExample capture />
      <HideOnEscapeExample name="Rejected callback dialog" />
      <HideOnEscapeExample accept name="Accepted callback dialog" />
      <HideOnEscapeExample
        accept
        name="Prevented callback dialog"
        preventDefault
      />
      <HideOnEscapeExample
        name="React portal callback dialog"
        portalChild
        stop
      />
      <button onClick={() => setShowDocumentRoot(true)}>
        Show document root example
      </button>
      {showDocumentRoot && <DocumentRootExample />}
    </>
  );
}
