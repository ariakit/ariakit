import * as Ariakit from "@ariakit/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function EmbeddedCombobox() {
  const store = Ariakit.useComboboxStore();
  const open = Ariakit.useStoreState(store, "open");
  const baseElement = Ariakit.useStoreState(store, "baseElement");
  const focusMovedToParent = useRef(false);

  useEffect(() => {
    if (!open) return;
    const frameWindow = baseElement?.ownerDocument.defaultView;
    if (!frameWindow) return;
    const parentWindow = frameWindow.parent;
    if (parentWindow === frameWindow) return;
    let parentDocument: Document;
    try {
      parentDocument = parentWindow.document;
    } catch {
      return;
    }
    const onFocusIn = () => {
      focusMovedToParent.current = true;
      store.hide();
    };
    parentDocument.addEventListener("focusin", onFocusIn, true);
    return () => parentDocument.removeEventListener("focusin", onFocusIn, true);
  }, [store, open, baseElement]);

  const autoFocusOnHide = useCallback(() => {
    const shouldAutoFocus = !focusMovedToParent.current;
    focusMovedToParent.current = false;
    return shouldAutoFocus;
  }, []);

  return (
    <>
      <Ariakit.ComboboxLabel store={store}>Favorite food</Ariakit.ComboboxLabel>
      <Ariakit.Combobox store={store} />
      <Ariakit.ComboboxPopover
        store={store}
        aria-label="Suggestions"
        autoFocusOnHide={autoFocusOnHide}
      >
        <Ariakit.ComboboxItem store={store} value="Apple" />
        <Ariakit.ComboboxItem store={store} value="Banana" />
      </Ariakit.ComboboxPopover>
    </>
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
