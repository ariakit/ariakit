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
  MenuSeparator,
  useMenuState,
  Button
} from "reakit";

function Example() {
  const focusInRef = React.useRef();
  const popover = usePopoverState();
  const dialog = useDialogState();
  const subdialog = useDialogState();
  const menu = useMenuState();
  return (
    <div style={{ padding: 100 }}>
      <PopoverDisclosure {...popover}>Open Popover</PopoverDisclosure>
      <Popover {...popover}>
        <PopoverArrow {...popover} />
        <Button onClick={popover.hide}>Hide</Button>
        <DialogDisclosure {...dialog}>Open Dialog</DialogDisclosure>
        <Dialog {...dialog}>
          <MenuDisclosure {...menu}>Open Menu</MenuDisclosure>
          <Menu {...menu}>
            <MenuItem {...menu}>New File</MenuItem>
            <MenuItem {...menu}>New Window</MenuItem>
            <MenuSeparator {...menu} />
            <MenuItem {...menu}>
              {props => (
                <DialogDisclosure {...props} {...subdialog}>
                  Open...
                </DialogDisclosure>
              )}
            </MenuItem>
            <Dialog {...subdialog}>
              I&apos;m a Dialog triggered by a menu item. Press ESC to close.
            </Dialog>
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
