import { ReactNode, forwardRef } from "react";
import {
  MenuButton,
  MenuButtonArrow,
  MenuButtonProps,
  MenuItem,
  Menu as MenuPopover,
  MenuSeparator,
  useMenuState,
} from "ariakit/menu";

type MenuProps = Omit<MenuButtonProps, "state"> & { label: ReactNode };

const Menu = forwardRef<HTMLButtonElement, MenuProps>(
  ({ label, children, ...props }, ref) => {
    const menu = useMenuState();
    return (
      <>
        <MenuButton {...props} state={menu} ref={ref}>
          {label} <MenuButtonArrow />
        </MenuButton>
        <MenuPopover state={menu} portal>
          {children}
        </MenuPopover>
      </>
    );
  }
);

export default function Example() {
  return (
    <Menu label="Edit">
      <MenuItem>Undo</MenuItem>
      <MenuItem>Redo</MenuItem>
      <MenuSeparator />
      <MenuItem as={Menu} label="Find">
        <MenuItem>Search the Web...</MenuItem>
        <MenuSeparator />
        <MenuItem>Find...</MenuItem>
        <MenuItem>Find Next</MenuItem>
      </MenuItem>
      <MenuItem as={Menu} label="Spelling and Grammar">
        <MenuItem>Show Spelling and Grammar</MenuItem>
        <MenuItem>Check Document Now</MenuItem>
      </MenuItem>
    </Menu>
  );
}
