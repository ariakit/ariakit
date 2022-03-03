import {
  HTMLAttributes,
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useContext,
} from "react";
import {
  Menu as BaseMenu,
  MenuItem as BaseMenuItem,
  MenuButton,
  MenuButtonArrow,
  useMenuState,
} from "ariakit/menu";

// Use React Context so we can determine if the menu is a submenu or not.
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

type MenuButtonProps = HTMLAttributes<HTMLDivElement> &
  RefAttributes<HTMLDivElement>;

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ label, children, ...props }, ref) => {
    const inSubmenu = useContext(MenuContext);
    const menu = useMenuState({
      gutter: 8,
      shift: inSubmenu ? -9 : 0,
    });

    const renderMenuButton = (menuButtonProps: MenuButtonProps) => (
      <MenuButton state={menu} className="button" {...menuButtonProps}>
        <span className="label">{label}</span>
        <MenuButtonArrow />
      </MenuButton>
    );

    return (
      <>
        {inSubmenu ? (
          // If it's a submenu, we have to combine the MenuButton and the
          // MenuItem components into a single component, so it works as a
          // submenu button.
          <BaseMenuItem className="menu-item" ref={ref} {...props}>
            {renderMenuButton}
          </BaseMenuItem>
        ) : (
          // Otherwise, we just render the menu button.
          renderMenuButton({ ref, ...props })
        )}
        <BaseMenu state={menu} className="menu">
          <MenuContext.Provider value={true}>{children}</MenuContext.Provider>
        </BaseMenu>
      </>
    );
  }
);
