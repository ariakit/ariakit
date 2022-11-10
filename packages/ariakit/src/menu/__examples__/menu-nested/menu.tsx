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
  useMenuStore,
} from "ariakit/menu/store";

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
    const nested = useContext(MenuContext);
    const menu = useMenuStore({
      gutter: 8,
      shift: nested ? -9 : 0,
    });

    const renderMenuButton = (menuButtonProps: MenuButtonProps) => (
      <MenuButton store={menu} className="button" {...menuButtonProps}>
        <span className="label">{label}</span>
        <MenuButtonArrow />
      </MenuButton>
    );

    return (
      <>
        {nested ? (
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
        <BaseMenu store={menu} className="menu">
          <MenuContext.Provider value={true}>{children}</MenuContext.Provider>
        </BaseMenu>
      </>
    );
  }
);
