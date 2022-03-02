import {
  HTMLAttributes,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
} from "react";
import {
  MenuItem as BaseMenuItem,
  MenuButton,
  MenuButtonArrow,
  Menu as MenuPopover,
  useMenuState,
} from "ariakit/menu";

// Use a React Context so we can determine if the menu is a submenu or not.
const MenuContext = createContext(false);

export type MenuItemProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  disabled?: boolean;
};

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ label, ...props }, ref) => {
    return (
      <BaseMenuItem className="menu-item" ref={ref} {...props}>
        {label}
      </BaseMenuItem>
    );
  }
);

export type MenuProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  disabled?: boolean;
};

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ label, children, ...props }, ref) => {
    const isSubmenu = useContext(MenuContext);
    const menu = useMenuState({
      gutter: 8,
      shift: isSubmenu ? -9 : 0,
    });

    const renderMenuButton = (props: HTMLAttributes<HTMLDivElement>) => (
      <MenuButton state={menu} className="button" {...props}>
        <span className="label">{label}</span>
        <MenuButtonArrow />
      </MenuButton>
    );

    return (
      <>
        {isSubmenu ? (
          // If it's a submenu, we have to combine the MenuButton and the
          // MenuItem components into a single component, so it works as a
          // submenu button.
          <BaseMenuItem className="menu-item" ref={ref} {...props}>
            {renderMenuButton}
          </BaseMenuItem>
        ) : (
          // Otherwise, we just render the menu button.
          renderMenuButton(props)
        )}
        <MenuPopover state={menu} className="menu">
          <MenuContext.Provider value={true}>{children}</MenuContext.Provider>
        </MenuPopover>
      </>
    );
  }
);
