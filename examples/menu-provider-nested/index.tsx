import "./style.css";
import { Menu, MenuButton, MenuButtonArrow, MenuItem } from "@ariakit/react";
import { MenuProvider } from "@ariakit/react-core/menu/menu-provider";

export default function Example() {
  return (
    <MenuProvider>
      <MenuButton className="button">Edit</MenuButton>
      <Menu className="menu" gutter={8}>
        <MenuItem className="menu-item">Undo</MenuItem>
        <MenuItem className="menu-item">Redo</MenuItem>
        <MenuProvider>
          <MenuItem className="menu-item" render={<MenuButton />}>
            <span className="label">Find</span>
            <MenuButtonArrow />
          </MenuItem>
          <Menu className="menu" gutter={8} shift={-9}>
            <MenuItem className="menu-item">Search the Web...</MenuItem>
            <MenuItem className="menu-item">Find...</MenuItem>
            <MenuItem className="menu-item">Find Next</MenuItem>
            <MenuItem className="menu-item">Find Previous</MenuItem>
          </Menu>
        </MenuProvider>
        <MenuProvider>
          <MenuItem className="menu-item" render={<MenuButton />}>
            <span className="label">Speech</span>
            <MenuButtonArrow />
          </MenuItem>
          <Menu className="menu" gutter={8} shift={-9}>
            <MenuItem className="menu-item">Start Speaking</MenuItem>
            <MenuItem className="menu-item" disabled>
              Stop Speaking
            </MenuItem>
          </Menu>
        </MenuProvider>
      </Menu>
    </MenuProvider>
  );
}
