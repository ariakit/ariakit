import * as Ariakit from "@ariakit/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// TODO: Remove once https://github.com/ariakit/ariakit/issues/4904 is fixed.
function usePopupWindowDismiss(store: Ariakit.MenuStore) {
  const open = Ariakit.useStoreState(store, "open");
  const contentElement = Ariakit.useStoreState(store, "contentElement");
  const prevOpenRef = useRef(false);

  // Add keydown and click listeners on the popup window's document so that
  // Escape and click-outside work correctly.
  useEffect(() => {
    if (!open) return;
    if (!contentElement) return;

    const doc = contentElement.ownerDocument;
    const win = doc.defaultView;
    // Only needed when rendering in a different window (popup)
    if (!win || win === window) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (event.defaultPrevented) return;
      store.hide();
    };

    const onClick = (event: MouseEvent) => {
      const { contentElement, disclosureElement } = store.getState();
      const target = event.target as Element | null;
      if (!target) return;
      if (contentElement?.contains(target)) return;
      if (disclosureElement?.contains(target)) return;
      store.hide();
    };

    doc.addEventListener("keydown", onKeyDown, true);
    doc.addEventListener("click", onClick, true);

    return () => {
      doc.removeEventListener("keydown", onKeyDown, true);
      doc.removeEventListener("click", onClick, true);
    };
  }, [store, open, contentElement]);

  // Fix focus restoration. Ariakit's built-in focusOnHide checks
  // document.activeElement on the main window instead of the popup window,
  // causing it to skip focus restoration.
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    if (!wasOpen || open) return;

    const { disclosureElement } = store.getState();
    if (!disclosureElement) return;

    const doc = disclosureElement.ownerDocument;
    const win = doc.defaultView;
    if (!win || win === window) return;

    // Use two rAFs to ensure Ariakit's own focus handling has settled and
    // the menu DOM has been fully updated before we check active element.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const activeEl = doc.activeElement;
        // Only restore if focus fell to nothing (body/null)
        if (activeEl && activeEl !== doc.body) return;
        disclosureElement.focus();
      });
    });
  }, [store, open]);
}

function Menu() {
  const store = Ariakit.useMenuStore();
  usePopupWindowDismiss(store);

  return (
    <Ariakit.MenuProvider store={store}>
      <Ariakit.MenuButton>Actions</Ariakit.MenuButton>
      <Ariakit.Menu gutter={8}>
        <Ariakit.MenuItem>Edit</Ariakit.MenuItem>
        <Ariakit.MenuItem>Share</Ariakit.MenuItem>
        <Ariakit.MenuItem>Delete</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}

function usePopoutWindow() {
  const [popoutWindow, setPopoutWindow] = useState<Window | null>(null);

  const open = () => {
    const popout = window.open("about:blank", "_popout", "popup");
    if (!popout) return;

    // Copy stylesheets from the parent window to the popup
    for (const sheet of document.styleSheets) {
      try {
        const style = popout.document.createElement("style");
        for (const rule of sheet.cssRules) {
          style.appendChild(popout.document.createTextNode(rule.cssText));
        }
        popout.document.head.appendChild(style);
      } catch {
        // Ignore cross-origin stylesheet errors
      }
    }

    setPopoutWindow(popout);
  };

  useEffect(() => {
    if (!popoutWindow) return;
    const onClose = () => setPopoutWindow(null);
    popoutWindow.addEventListener("unload", onClose);
    return () => popoutWindow.removeEventListener("unload", onClose);
  }, [popoutWindow]);

  return { open, window: popoutWindow };
}

export default function Example() {
  const popout = usePopoutWindow();

  return (
    <>
      <button onClick={popout.open}>Open popout window</button>
      {popout.window && createPortal(<Menu />, popout.window.document.body)}
    </>
  );
}
