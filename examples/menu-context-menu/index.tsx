import "./style.css";
import { useState } from "react";
import * as Ariakit from "@ariakit/react";

export default function Example() {
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();
  return (
    <div
      className="wrapper"
      onContextMenu={(event) => {
        event.preventDefault();
        setAnchorRect({ x: event.clientX, y: event.clientY });
        menu.show();
      }}
    >
      Right click here
      <Ariakit.Menu
        store={menu}
        modal
        getAnchorRect={() => anchorRect}
        className="menu"
      >
        <Ariakit.MenuItem className="menu-item">Back</Ariakit.MenuItem>
        <Ariakit.MenuItem className="menu-item" disabled>
          Forward
        </Ariakit.MenuItem>
        <Ariakit.MenuItem className="menu-item">Reload</Ariakit.MenuItem>
        <Ariakit.MenuSeparator className="separator" />
        <Ariakit.MenuItem className="menu-item">
          View Page Source
        </Ariakit.MenuItem>
        <Ariakit.MenuItem className="menu-item">Inspect</Ariakit.MenuItem>
      </Ariakit.Menu>
    </div>
  );
}
