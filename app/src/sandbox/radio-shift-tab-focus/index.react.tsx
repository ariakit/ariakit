import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function RadioForm() {
  return (
    <form>
      <Ariakit.RadioProvider>
        <Ariakit.RadioGroup aria-label="Options">
          <label>
            <Ariakit.Radio value="one" />
            Option 1
          </label>
          <label>
            <Ariakit.Radio value="two" />
            Option 2
          </label>
          <label>
            <Ariakit.Radio value="three" />
            Option 3
          </label>
        </Ariakit.RadioGroup>
      </Ariakit.RadioProvider>
      <button type="button">After</button>
    </form>
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
    <>
      <RadioForm />
      {iframeContainer ? createPortal(<RadioForm />, iframeContainer) : null}
      <iframe
        ref={setIframe}
        title="Embedded options"
        style={{
          border: "1px solid",
          display: "block",
          height: 80,
          width: 320,
        }}
      />
    </>
  );
}
