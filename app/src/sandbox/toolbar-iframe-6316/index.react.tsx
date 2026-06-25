import * as Ariakit from "@ariakit/react";
import type { KeyboardEvent } from "react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

// TODO: Remove this workaround once
// https://github.com/ariakit/ariakit/issues/6316 is fixed.
// Iframe inputs skip Ariakit's built-in text boundary check, so re-check the
// caret before allowing toolbar focus to move.
function shouldMoveOnKeyPress(event: KeyboardEvent<HTMLElement>) {
  const input = event.currentTarget as HTMLInputElement;
  if (event.key === "ArrowLeft") {
    return (input.selectionStart ?? 0) === 0;
  }
  if (event.key === "ArrowRight") {
    return (input.selectionEnd ?? 0) === input.value.length;
  }
  return true;
}

function FormattingToolbar() {
  return (
    <Ariakit.Toolbar
      aria-label="Formatting"
      style={{ display: "flex", gap: 8 }}
    >
      <Ariakit.ToolbarItem>Bold</Ariakit.ToolbarItem>
      <Ariakit.ToolbarItem
        render={<input type="text" aria-label="Find" />}
        moveOnKeyPress={shouldMoveOnKeyPress}
      />
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
