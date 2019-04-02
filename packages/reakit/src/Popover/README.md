---
path: /docs/popover
redirect_from:
  - /components/popover
  - /components/popover/popovercontainer
  - /components/popover/popoverhide
  - /components/popover/popovershow
  - /components/popover/popovertoggle
---

# Popover

```jsx
import React from "react";
import {
  Popover,
  PopoverArrow,
  PopoverDisclosure,
  usePopoverState,
  Dialog,
  DialogDisclosure,
  useDialogState,
  Menu,
  MenuDisclosure,
  MenuItem,
  unstable_MenuItemDisclosure as MenuItemDisclosure,
  MenuSeparator,
  useMenuState
} from "reakit";

function Example() {
  const focusInRef = React.useRef();
  const popover = usePopoverState();
  const dialog = useDialogState();
  const subdialog = useDialogState();
  const menu = useMenuState();
  const submenu = useMenuState({}, menu);
  return (
    <div style={{ padding: 100 }}>
      <PopoverDisclosure {...popover}>Open Popover</PopoverDisclosure>
      <Popover {...popover}>
        <PopoverArrow {...popover} />
        <DialogDisclosure {...dialog}>Open Dialog</DialogDisclosure>
        <Dialog {...dialog}>
          <MenuDisclosure {...menu}>Open Menu</MenuDisclosure>
          <Menu {...menu}>
            <MenuItem {...menu}>New File</MenuItem>
            <MenuItem {...menu}>New Window</MenuItem>
            <MenuSeparator {...menu} />
            <MenuItemDisclosure unstable_parent={menu} {...subdialog}>
              Open...
            </MenuItemDisclosure>
            <Dialog {...subdialog}>
              I&apos;m a Dialog triggered by a menu item. Press ESC to close.
            </Dialog>
            <MenuItemDisclosure {...submenu}>Open Recent</MenuItemDisclosure>
            <Menu {...submenu}>
              <MenuItem {...submenu}>Reopen Closed Editor</MenuItem>
              <MenuItem {...submenu}>Clear Recently Opened</MenuItem>
            </Menu>
          </Menu>
        </Dialog>
      </Popover>
    </div>
  );
}
```

```jsx
import React from "react";
import {
  Popover,
  PopoverArrow,
  PopoverDisclosure,
  PopoverHide,
  PopoverBackdrop,
  usePopoverState
} from "reakit";

function Example() {
  const focusInRef = React.useRef();
  const popover = usePopoverState();
  return (
    <div style={{ padding: 100 }}>
      <PopoverDisclosure {...popover}>Disclosure</PopoverDisclosure>
      <PopoverBackdrop {...popover} />
      <Popover {...popover}>
        <PopoverArrow {...popover} />
        dsada
      </Popover>
      <input />
    </div>
  );
}
```
