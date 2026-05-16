import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function Menu() {
  return (
    <Ariakit.MenuProvider>
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
