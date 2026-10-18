import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

// A document editor renders an attachment preview in a portal that preserves
// the tab order. The preview shows the document in a same-origin iframe with a
// Download button that the user must be able to reach with Tab every time focus
// returns to the panel.
function AttachmentPreview() {
  const [frameBody, setFrameBody] = useState<HTMLElement | null>(null);

  const setFrame = useCallback((element: HTMLIFrameElement | null) => {
    setFrameBody(element?.contentDocument?.body ?? null);
  }, []);

  return (
    <aside aria-label="Attachment preview">
      <Ariakit.Button>Preview settings</Ariakit.Button>
      {frameBody
        ? createPortal(<button>Download document</button>, frameBody)
        : null}
      <iframe ref={setFrame} title="Contract document preview" />
    </aside>
  );
}

export default function Example() {
  return (
    <>
      <label>
        Document title <input defaultValue="Contract" />
      </label>
      {/*
       * TODO: Remove the workaround after
       * https://github.com/ariakit/ariakit/issues/7963 is fixed.
       */}
      <Ariakit.Portal portal={false} preserveTabOrder>
        <AttachmentPreview />
      </Ariakit.Portal>
      <button>Save document</button>
    </>
  );
}
