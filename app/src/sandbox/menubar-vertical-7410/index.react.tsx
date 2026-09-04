import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

export default function Example() {
  const [rtl, setRtl] = useState(false);
  const [horizontal, setHorizontal] = useState(false);
  const horizontalMenubar = Ariakit.useMenubarStore({ rtl });
  return (
    <div className="flex w-48 flex-col gap-6">
      <label className="flex gap-2">
        <input
          type="checkbox"
          tabIndex={0}
          checked={rtl}
          onChange={(event) => setRtl(event.target.checked)}
        />
        Right to left
      </label>
      <label className="flex gap-2">
        <input
          type="checkbox"
          tabIndex={0}
          checked={horizontal}
          onChange={(event) => setHorizontal(event.target.checked)}
        />
        Horizontal menubar
      </label>
      <Ariakit.Menubar
        aria-label="Editor"
        store={horizontal ? horizontalMenubar : undefined}
        orientation={horizontal ? "horizontal" : "vertical"}
        rtl={rtl}
        dir={rtl ? "rtl" : "ltr"}
        className={horizontal ? "flex gap-1" : "flex w-32 flex-col gap-1"}
      >
        <Ariakit.MenuProvider>
          <Ariakit.MenuItem
            className="menubar-item"
            render={<Ariakit.MenuButton />}
          >
            File
          </Ariakit.MenuItem>
          <Ariakit.Menu className="menu">
            <Ariakit.MenuItem className="menu-item">New</Ariakit.MenuItem>
            <Ariakit.MenuItem className="menu-item">Open</Ariakit.MenuItem>
          </Ariakit.Menu>
        </Ariakit.MenuProvider>
        <Ariakit.MenuProvider>
          <Ariakit.MenuItem
            className="menubar-item"
            render={<Ariakit.MenuButton />}
          >
            Edit
          </Ariakit.MenuItem>
          <Ariakit.Menu className="menu">
            <Ariakit.MenuItem className="menu-item">Undo</Ariakit.MenuItem>
            <Ariakit.MenuItem className="menu-item">Redo</Ariakit.MenuItem>
          </Ariakit.Menu>
        </Ariakit.MenuProvider>
      </Ariakit.Menubar>
    </div>
  );
}
