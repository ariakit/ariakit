import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function EmbeddedList() {
  const composite = Ariakit.useCompositeStore({ orientation: "vertical" });
  return (
    <Ariakit.Composite
      store={composite}
      role="toolbar"
      aria-orientation="vertical"
      aria-label="Embedded items"
    >
      {Array.from({ length: 100 }, (_, index) => (
        <Ariakit.CompositeItem
          key={index}
          style={{
            boxSizing: "border-box",
            display: "block",
            height: 50,
            margin: 0,
            width: "100%",
          }}
        >
          Item {index + 1}
        </Ariakit.CompositeItem>
      ))}
    </Ariakit.Composite>
  );
}

function initializeFrameBody(body: HTMLElement) {
  body.style.margin = "0";
}

export default function Example() {
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!iframe) return;
    // Same-origin embedded widget (react-frame-component style): the list is
    // taller than the iframe viewport and there's no overflow container inside,
    // so the iframe's own document is the scroller.
    const doc = iframe.contentDocument;
    if (!doc?.body) return;
    initializeFrameBody(doc.body);
    const root = createRoot(doc.body);
    root.render(<EmbeddedList />);
    return () => {
      setTimeout(() => root.unmount());
    };
  }, [iframe]);

  return (
    <iframe
      ref={setIframe}
      title="Embedded list"
      style={{ border: "1px solid", display: "block", height: 220, width: 320 }}
    />
  );
}
