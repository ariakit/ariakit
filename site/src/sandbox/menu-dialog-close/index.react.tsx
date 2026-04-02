import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
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
