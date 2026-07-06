import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";
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
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

  const setIframe = useCallback((element: HTMLIFrameElement | null) => {
    setIframeBody(element?.contentDocument?.body ?? null);
  }, []);

  return (
    <>
      <RadioForm />
      {iframeBody ? createPortal(<RadioForm />, iframeBody) : null}
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
