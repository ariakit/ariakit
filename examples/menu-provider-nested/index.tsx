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
          <MenuButton className="menu-item" render={<MenuItem />}>
            <span className="label">Find</span>
            <MenuButtonArrow />
          </MenuButton>
          <Menu className="menu" gutter={8} shift={-9}>
            <MenuItem className="menu-item">Search the Web...</MenuItem>
            <MenuItem className="menu-item">Find...</MenuItem>
            <MenuItem className="menu-item">Find Next</MenuItem>
            <MenuItem className="menu-item">Find Previous</MenuItem>
          </Menu>
        </MenuProvider>
        <MenuProvider>
          <MenuButton className="menu-item" render={<MenuItem />}>
            <span className="label">Speech</span>
            <MenuButtonArrow />
          </MenuButton>
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
