import { ReactNode, forwardRef } from "react";
import {
  Menu as AriaMenu,
  MenuButton,
  MenuButtonProps,
  useMenuState,
} from "ariakit";

type MenuProps = Omit<MenuButtonProps, "state"> & {
  label: ReactNode;
};

const Menu = forwardRef<HTMLButtonElement, MenuProps>(
  ({ label, ...props }, ref) => {
    const menu = useMenuState();
    return (
      <>
        <MenuButton ref={ref} {...props} state={menu}>
          {label}
        </MenuButton>
        <AriaMenu state={menu}>{props.children}</AriaMenu>
      </>
    );
  }
);

export default Menu;
