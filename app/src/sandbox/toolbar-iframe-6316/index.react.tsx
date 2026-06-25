import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

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

  useEffect(() => {
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc?.body) return;
    const root = createRoot(doc.body);
    root.render(<FormattingToolbar />);
    return () => {
      setTimeout(() => root.unmount());
    };
  }, [iframe]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <FormattingToolbar />
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
