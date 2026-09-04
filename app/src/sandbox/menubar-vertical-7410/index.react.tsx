import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import "./style.css";

export default function Example() {
  const [rtl, setRtl] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <label className="flex gap-2">
        <input
          type="checkbox"
          tabIndex={0}
          checked={rtl}
          onChange={(event) => setRtl(event.target.checked)}
        />
        Right to left
      </label>
      <Ariakit.Menubar
        aria-label="Editor"
        orientation="vertical"
        rtl={rtl}
        dir={rtl ? "rtl" : "ltr"}
        className="flex w-32 flex-col gap-1"
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
