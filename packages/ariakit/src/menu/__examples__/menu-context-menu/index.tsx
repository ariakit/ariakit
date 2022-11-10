import { useState } from "react";
import {
  Menu,
  MenuItem,
  MenuSeparator,
  useMenuStore,
} from "ariakit/menu/store";
import "./style.css";

export default function Example() {
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = useMenuStore({ getAnchorRect: () => anchorRect });
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
      <Menu store={menu} modal className="menu">
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
