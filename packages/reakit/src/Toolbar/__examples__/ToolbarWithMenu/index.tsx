import React, { RefObject } from "react";
import {
  useToolbarState,
  Toolbar,
  ToolbarItem,
  ToolbarProps,
} from "reakit/Toolbar";
import { useMenuState, MenuButton, Menu, MenuItem } from "reakit/Menu";
import { Button } from "reakit/Button";

const MoreItems = React.forwardRef((props: ToolbarProps, ref) => {
  const menu = useMenuState({ placement: "bottom-end" });
  const buttonRef = ref as RefObject<HTMLButtonElement>;

  return (
    <>
      <MenuButton
        {...menu}
        {...props}
        ref={buttonRef}
        as={Button}
        aria-label="Other fruits"
      >
        Other Fruits
      </MenuButton>
      <Menu {...menu} aria-label="Other fruits">
        <MenuItem {...menu}>
          Pears &nbsp;
          <span role="img" aria-label="Pear emoji">
            🍐
          </span>
        </MenuItem>
        <MenuItem {...menu}>
          Kiwis &nbsp;
          <span role="img" aria-label="Kiwi emoji">
            🥝
          </span>
        </MenuItem>
        <MenuItem {...menu}>
          Lemons &nbsp;
          <span role="img" aria-label="Lemon emoji">
            🍋
          </span>
        </MenuItem>
      </Menu>
    </>
  );
});

export default function ToolbarWithMenu() {
  const toolbar = useToolbarState();
  return (
    <Toolbar {...toolbar} aria-label="Fruits">
      <ToolbarItem {...toolbar} as={Button}>
        Apples &nbsp;
        <span role="img" aria-label="Apple emoji">
          🍏
        </span>
      </ToolbarItem>
      <ToolbarItem {...toolbar} as={Button}>
        Oranges &nbsp;
        <span role="img" aria-label="Orange emoji">
          🍊
        </span>
      </ToolbarItem>
      <ToolbarItem {...toolbar} as={MoreItems} />
    </Toolbar>
  );
}
