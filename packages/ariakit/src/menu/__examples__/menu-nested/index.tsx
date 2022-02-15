import { MenuBar, useMenuBarState } from "ariakit/menu";
import { Menu, MenuItem } from "./menu";
import "./style.css";

export default function Example() {
  const menubar = useMenuBarState({
    // virtualFocus: true,
  });
  return (
    <>
      <MenuBar state={menubar} className="menubar">
        <MenuItem as={Menu} label="File" className="button">
          <MenuItem className="menu-item">New</MenuItem>
          <MenuItem className="menu-item">Open</MenuItem>
          <MenuItem className="menu-item">Save</MenuItem>
          <MenuItem as={Menu} label="Export" shift={-8} className="menu-item">
            <MenuItem className="menu-item">Export as PDF</MenuItem>
            <MenuItem className="menu-item">Export as PNG</MenuItem>
          </MenuItem>
          <MenuItem as={Menu} label="Export" shift={-8} className="menu-item">
            <MenuItem className="menu-item">Export as PDF</MenuItem>
            <MenuItem className="menu-item">Export as PNG</MenuItem>
          </MenuItem>
        </MenuItem>
        <MenuItem as={Menu} label="File" className="button">
          <MenuItem className="menu-item">New</MenuItem>
          <MenuItem className="menu-item">Open</MenuItem>
          <MenuItem className="menu-item">Save</MenuItem>
          <MenuItem as={Menu} label="Export" shift={-8} className="menu-item">
            <MenuItem className="menu-item">Export as PDF</MenuItem>
            <MenuItem className="menu-item">Export as PNG</MenuItem>
          </MenuItem>
          <MenuItem as={Menu} label="Export" shift={-8} className="menu-item">
            <MenuItem className="menu-item">Export as PDF</MenuItem>
            <MenuItem className="menu-item">Export as PNG</MenuItem>
          </MenuItem>
        </MenuItem>
        <MenuItem as={Menu} label="File" className="button">
          <MenuItem className="menu-item">New</MenuItem>
          <MenuItem className="menu-item">Open</MenuItem>
          <MenuItem className="menu-item">Save</MenuItem>
          <MenuItem as={Menu} label="Export" shift={-8} className="menu-item">
            <MenuItem className="menu-item">Export as PDF</MenuItem>
            <MenuItem className="menu-item">Export as PNG</MenuItem>
          </MenuItem>
          <MenuItem as={Menu} label="Export" shift={-8} className="menu-item">
            <MenuItem className="menu-item">Export as PDF</MenuItem>
            <MenuItem className="menu-item">Export as PNG</MenuItem>
          </MenuItem>
        </MenuItem>
      </MenuBar>
    </>
  );
}
