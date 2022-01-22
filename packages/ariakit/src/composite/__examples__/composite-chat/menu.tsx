import { ElementType, ReactNode, forwardRef } from "react";
import { Button } from "ariakit/button";
import {
  MenuButton,
  MenuButtonProps,
  Menu as MenuPopover,
  MenuProps as MenuPopoverProps,
  useMenuState,
} from "ariakit/menu";

export type MenuProps = Omit<MenuButtonProps<ElementType>, "state"> & {
  label: ReactNode;
  popoverProps?: Omit<MenuPopoverProps, "state">;
};

const Menu = forwardRef<HTMLButtonElement, MenuProps>(
  ({ label, popoverProps, ...props }, ref) => {
    const menu = useMenuState();
    return (
      <>
        <MenuButton as={Button} {...props} ref={ref} state={menu}>
          {label}
        </MenuButton>
        {menu.mounted && (
          <MenuPopover className="menu" {...popoverProps} state={menu}>
            {props.children}
          </MenuPopover>
        )}
      </>
    );
  }
);

export default Menu;
