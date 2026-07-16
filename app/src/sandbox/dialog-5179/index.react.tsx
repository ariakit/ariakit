import * as Ariakit from "@ariakit/react";
import { useEffect, useId, useState } from "react";
import { createRoot } from "react-dom/client";

function Autocomplete() {
  const [open, setOpen] = useState(true);
  const inputId = useId();
  const listboxId = useId();

  return (
    <div>
      <label htmlFor={inputId}>Search</label>
      <input
        id={inputId}
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-autocomplete="list"
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          if (!open) return;
          event.stopPropagation();
          setOpen(false);
        }}
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
  portal?: boolean;
}

function DialogExample({ portal }: DialogExampleProps) {
  return (
    <Ariakit.DialogProvider>
      <Ariakit.DialogDisclosure>Open dialog</Ariakit.DialogDisclosure>
      <Ariakit.Dialog portal={portal}>
        <Ariakit.DialogHeading>Dialog</Ariakit.DialogHeading>
        <Autocomplete />
      </Ariakit.Dialog>
    </Ariakit.DialogProvider>
  );
}

function DocumentRootExample() {
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const document = iframe?.contentDocument;
    if (!document) return;
    const root = createRoot(document);
    root.render(<DialogExample portal={false} />);
    return () => root.unmount();
  }, [iframe]);

  return <iframe ref={setIframe} title="Document root example" />;
}

export default function Example() {
  const [showDocumentRoot, setShowDocumentRoot] = useState(false);
  return (
    <>
      <DialogExample />
      <button onClick={() => setShowDocumentRoot(true)}>
        Show document root example
      </button>
      {showDocumentRoot && <DocumentRootExample />}
    </>
  );
}
