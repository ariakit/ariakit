import * as Ariakit from "@ariakit/react";
import { useEffect, useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);

  // Allow opening the dialog programmatically via F2 (for testing that
  // programmatic opens don't use stale mousedown data as disclosure).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F2") {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <p>Non-interactive text</p>
      <Ariakit.Button onClick={() => setOpen(true)}>Open dialog</Ariakit.Button>
      <Ariakit.Dialog
        open={open}
        onClose={() => setOpen(false)}
        backdrop={<div style={{ position: "fixed", inset: 0 }} />}
        style={{ position: "fixed", inset: 16 }}
      >
        <Ariakit.DialogHeading>Dialog</Ariakit.DialogHeading>
        <p>Content</p>
        <Ariakit.MenuProvider>
          <Ariakit.MenuButton>Menu</Ariakit.MenuButton>
          <Ariakit.Menu portal>
            <Ariakit.MenuItem>Item 1</Ariakit.MenuItem>
            <Ariakit.MenuItem>Item 2</Ariakit.MenuItem>
            <Ariakit.MenuItem>Item 3</Ariakit.MenuItem>
          </Ariakit.Menu>
        </Ariakit.MenuProvider>
      </Ariakit.Dialog>
    </>
  );
}
