import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";
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
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

  const setIframe = useCallback((element: HTMLIFrameElement | null) => {
    setIframeBody(element?.contentDocument?.body ?? null);
  }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <FormattingToolbar />
      {iframeBody ? createPortal(<FormattingToolbar />, iframeBody) : null}
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
