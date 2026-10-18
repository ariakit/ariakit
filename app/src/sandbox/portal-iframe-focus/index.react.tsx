import * as Ariakit from "@ariakit/react";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

interface FrameProps {
  title: string;
  children: ReactNode;
}

// Renders the children in the body of a same-origin iframe.
function Frame({ title, children }: FrameProps) {
  const [frameBody, setFrameBody] = useState<HTMLElement | null>(null);

  const setFrame = useCallback((element: HTMLIFrameElement | null) => {
    setFrameBody(element?.contentDocument?.body ?? null);
  }, []);

  return (
    <>
      {frameBody ? createPortal(children, frameBody) : null}
      <iframe ref={setFrame} title={title} />
    </>
  );
}

// A document editor renders an attachment preview in a portal that preserves
// the tab order. The preview shows the document in a same-origin iframe with a
// Download button that the user must be able to reach with Tab every time focus
// returns to the panel, and leave with Shift+Tab back to the panel controls.
function AttachmentPreview() {
  return (
    <aside aria-label="Attachment preview">
      <Ariakit.Button>Preview settings</Ariakit.Button>
      <Frame title="Contract document preview">
        <button>Download document</button>
      </Frame>
    </aside>
  );
}

// The editor toolbar embeds a signature pad in a same-origin iframe. Entering
// the toolbar container must move focus to the button inside the iframe.
function EditorToolbar() {
  return (
    <Ariakit.Toolbar aria-label="Editor tools">
      <Ariakit.ToolbarItem>Bold</Ariakit.ToolbarItem>
      <Ariakit.ToolbarContainer role="group" aria-label="Signature pad">
        <Frame title="Signature pad">
          <button>Clear signature</button>
        </Frame>
      </Ariakit.ToolbarContainer>
    </Ariakit.Toolbar>
  );
}

export default function Example() {
  return (
    <>
      <label>
        Document title <input defaultValue="Contract" />
      </label>
      <Ariakit.Portal preserveTabOrder>
        <AttachmentPreview />
      </Ariakit.Portal>
      <button>Save document</button>
      <EditorToolbar />
    </>
  );
}
