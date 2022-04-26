import { useState } from "react";
import { Menu, MenuItem, MenuSeparator, useMenuState } from "ariakit/menu";
import "./style.css";

export default function Example() {
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = useMenuState({ getAnchorRect: () => anchorRect });
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
      <Menu state={menu} modal className="menu">
        <MenuItem className="menu-item">Back</MenuItem>
        <MenuItem className="menu-item" disabled>
          Forward
        </MenuItem>
        <MenuItem className="menu-item">Reload</MenuItem>
        <MenuSeparator className="separator" />
        <MenuItem className="menu-item">View Page Source</MenuItem>
        <MenuItem className="menu-item">Inspect</MenuItem>
      </Menu>
    </div>
  );
}
