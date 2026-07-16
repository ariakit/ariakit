import * as Ariakit from "@ariakit/react";
import type { KeyboardEvent } from "react";
import { useEffect, useId, useState } from "react";
import { createRoot } from "react-dom/client";

interface AutocompleteProps {
  capture?: boolean;
}

function Autocomplete({ capture }: AutocompleteProps) {
  const [open, setOpen] = useState(true);
  const inputId = useId();
  const listboxId = useId();
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return;
    if (!open) return;
    event.stopPropagation();
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
  stopOnEscape?: boolean;
  stopOnEscapeCapture?: boolean;
}

function DialogExample({
  capture,
  modal,
  name = "Dialog",
  portal,
  stopOnEscape,
  stopOnEscapeCapture,
}: DialogExampleProps) {
  const dialog = (
    <Ariakit.DialogProvider>
      <Ariakit.DialogDisclosure>
        Open {name.toLowerCase()}
      </Ariakit.DialogDisclosure>
      <Ariakit.Dialog modal={modal} portal={portal}>
        <Ariakit.DialogHeading>{name}</Ariakit.DialogHeading>
        <Autocomplete capture={capture} />
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  );
  if (!stopOnEscape && !stopOnEscapeCapture) return dialog;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
  };
  return (
    <div
      onKeyDown={stopOnEscape ? onKeyDown : undefined}
      onKeyDownCapture={stopOnEscapeCapture ? onKeyDown : undefined}
    >
      {dialog}
    </div>
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
    root.render(
      <>
        <DialogExample name="Document root dialog" portal={false} />
        <DialogExample
          capture
          name="Document root capture dialog"
          portal={false}
        />
        <DialogExample
          modal={false}
          name="Document root outside dialog"
          portal={false}
          stopOnEscapeCapture
        />
      </>,
    );
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
      <button onClick={() => setShowDocumentRoot(true)}>
        Show document root example
      </button>
      {showDocumentRoot && <DocumentRootExample />}
    </>
  );
}
