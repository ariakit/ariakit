import * as Ariakit from "@ariakit/react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

function EmbeddedCombobox() {
  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.ComboboxLabel>Favorite food</Ariakit.ComboboxLabel>
      <Ariakit.Combobox />
      <Ariakit.ComboboxPopover aria-label="Suggestions">
        <Ariakit.ComboboxItem value="Apple" />
        <Ariakit.ComboboxItem value="Banana" />
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  const [iframeBody, setIframeBody] = useState<HTMLElement | null>(null);

  const setIframe = useCallback((element: HTMLIFrameElement | null) => {
    setIframeBody(element?.contentDocument?.body ?? null);
  }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {iframeBody ? createPortal(<EmbeddedCombobox />, iframeBody) : null}
      <iframe
        ref={setIframe}
        title="Embedded combobox"
        style={{ border: "1px solid", height: 160, width: 320 }}
      />
      <button type="button">After iframe</button>
    </div>
  );
}
