import * as Ariakit from "@ariakit/react";
import { useState } from "react";

export default function Example() {
  const [mode, setMode] = useState<"active" | "passive">();

  if (!mode) {
    return (
      <>
        <button onClick={() => setMode("active")}>Add item</button>
        <button onClick={() => setMode("passive")}>Add passive item</button>
      </>
    );
  }

  return (
    <Ariakit.MenuProvider defaultOpen>
      <Ariakit.MenuButton>Actions for new item</Ariakit.MenuButton>
      <Ariakit.Menu
        autoFocusOnShow={mode === "passive" ? false : undefined}
        modal={false}
      >
        <Ariakit.MenuItem>Rename</Ariakit.MenuItem>
        <Ariakit.MenuItem>Duplicate</Ariakit.MenuItem>
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
}
