import { HTMLAttributes, ReactNode, forwardRef } from "react";
import {
  MenuButton,
  MenuButtonArrow,
  Menu as MenuPopover,
  useMenuState,
} from "ariakit/menu";

export { MenuItem, MenuSeparator } from "ariakit/menu";

export type MenuProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  shift?: number;
};

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ label, children, shift, ...props }, ref) => {
    const menu = useMenuState({
      gutter: 8,
      shift,
      // virtualFocus: true,
    });
    return (
      <>
        <MenuButton state={menu} className="button" ref={ref} {...props}>
          <span className="label">{label}</span>
          <MenuButtonArrow />
        </MenuButton>
        {menu.mounted && (
          <MenuPopover portal state={menu} className="menu">
            {children}
          </MenuPopover>
        )}
      </>
    );
  }
);
