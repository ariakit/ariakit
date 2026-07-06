import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function FormattingToolbar() {
  return (
    <Ariakit.Toolbar
      aria-label="Formatting"
      style={{ display: "flex", gap: 8 }}
    >
      <Ariakit.ToolbarItem>Bold</Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem render={<input type="text" aria-label="Find" />} />
      <Ariakit.ToolbarItem>Italic</Ariakit.ToolbarItem>
    </Ariakit.Toolbar>
  );
}

export default function Example() {
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  const [iframeContainer, setIframeContainer] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc?.body) return;
    const container = doc.createElement("div");
    doc.body.appendChild(container);
    setIframeContainer(container);
    return () => {
      container.remove();
    };
  }, [iframe]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <FormattingToolbar />
      {iframeContainer
        ? createPortal(<FormattingToolbar />, iframeContainer)
        : null}
      <iframe
        ref={setIframe}
        title="Embedded editor"
        style={{
          border: "1px solid",
          display: "block",
          height: 80,
          width: 360,
        }}
      />
    </div>
  );
}
