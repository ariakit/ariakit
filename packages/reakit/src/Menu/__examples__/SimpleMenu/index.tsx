import * as React from "react";
import { useMenuState, Menu, MenuButton, MenuItem } from "reakit/Menu";
import { Portal } from "reakit/Portal";

export default function SimpleMenu() {
  const menu = useMenuState();
  return (
    <>
      <MenuButton {...menu}>Preferences</MenuButton>
      <Portal>
        <Menu {...menu} aria-label="Preferences">
          <MenuItem {...menu}>Settings</MenuItem>
          <MenuItem {...menu}>Extensions</MenuItem>
          <MenuItem {...menu}>Keyboard shortcuts</MenuItem>
        </Menu>
      </Portal>
      <div style={{ marginTop: "100vh" }}>Bottom</div>
    </>
  );
}
