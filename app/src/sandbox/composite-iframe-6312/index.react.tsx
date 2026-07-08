import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

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

export default function Example() {
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

  const setIframe = useCallback((element: HTMLIFrameElement | null) => {
    // Same-origin embedded widget (react-frame-component style): the list is
    // taller than the iframe viewport and there's no overflow container inside,
    // so the iframe's own document is the scroller.
    const body = element?.contentDocument?.body;
    if (!body) {
      setIframeBody(null);
      return;
    }
    body.style.margin = "0";
    setIframeBody(body);
  }, []);

  return (
    <>
      {iframeBody ? createPortal(<EmbeddedList />, iframeBody) : null}
      <iframe
        ref={setIframe}
        title="Embedded list"
        style={{
          border: "1px solid",
          display: "block",
          height: 220,
          width: 320,
        }}
      />
    </>
  );
}
