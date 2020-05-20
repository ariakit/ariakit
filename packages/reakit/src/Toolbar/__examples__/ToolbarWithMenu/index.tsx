import React, { RefObject } from "react";
import { useToolbarState, Toolbar, ToolbarItem } from "reakit/Toolbar";
import { useMenuState, MenuButton, Menu, MenuItem } from "reakit/Menu";
import { Button } from "reakit/Button";
import { ToolbarProps } from "../../Toolbar";

const MoreItems = React.forwardRef<HTMLButtonElement, ToolbarProps>(
  (props, ref) => {
    const menu = useMenuState({ placement: "bottom-end" });
    const buttonRef = ref;

    return (
      <>
        <MenuButton
          {...menu}
          {...props}
          ref={buttonRef}
          aria-label="Other fruits"
        >
          Other Fruits
        </MenuButton>
        <Menu {...menu} aria-label="Other fruits">
          <MenuItem {...menu}>Pears</MenuItem>
          <MenuItem {...menu}>Kiwis</MenuItem>
          <MenuItem {...menu}>Lemons</MenuItem>
        </Menu>
      </>
    );
  }
);

export default function ToolbarWithMenu() {
  const toolbar = useToolbarState();
  return (
    <Toolbar {...toolbar} aria-label="Fruits">
      <ToolbarItem {...toolbar} as={Button}>
        Apples
      </ToolbarItem>
      <ToolbarItem {...toolbar} as={Button}>
        Oranges
      </ToolbarItem>
      <ToolbarItem {...toolbar} as={MoreItems} />
    </Toolbar>
  );
}
