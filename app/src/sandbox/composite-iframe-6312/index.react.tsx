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
      // Workaround for https://github.com/ariakit/ariakit/issues/6312: give an
      // ancestor inside the iframe a bounded height and `overflow-y: auto` so
      // `getScrollingElement` finds an in-frame scroller before falling back to
      // the outer page's document.
      style={{ height: "100vh", overflowY: "auto" }}
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

export default function Example() {
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!iframe) return;
    // Same-origin embedded widget (react-frame-component style): the list is
    // taller than the iframe viewport and there's no overflow container inside,
    // so the iframe's own document is the scroller.
    const doc = iframe.contentDocument;
    if (!doc?.body) return;
    doc.body.style.margin = "0";
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
