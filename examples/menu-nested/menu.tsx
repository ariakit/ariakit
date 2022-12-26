import {
  HTMLAttributes,
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useContext,
} from "react";
import * as Ariakit from "@ariakit/react";

// Use React Context so we can determine if the menu is a submenu or not.
const MenuContext = createContext(false);

export type MenuItemProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  disabled?: boolean;
};

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ label, ...props }, ref) => {
    return (
      <Ariakit.MenuItem className="menu-item" ref={ref} {...props}>
        {label}
      </Ariakit.MenuItem>
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
    const menu = Ariakit.useMenuStore({
      gutter: 8,
      shift: nested ? -9 : 0,
    });

    const renderMenuButton = (menuButtonProps: MenuButtonProps) => (
      <Ariakit.MenuButton store={menu} className="button" {...menuButtonProps}>
        <span className="label">{label}</span>
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
    );

    return (
      <>
        {nested ? (
          // If it's a submenu, we have to combine the MenuButton and the
          // MenuItem components into a single component, so it works as a
          // submenu button.
          <Ariakit.MenuItem className="menu-item" ref={ref} {...props}>
            {renderMenuButton}
          </Ariakit.MenuItem>
        ) : (
          // Otherwise, we just render the menu button.
          renderMenuButton({ ref, ...props })
        )}
        <Ariakit.Menu store={menu} className="menu">
          <MenuContext.Provider value={true}>{children}</MenuContext.Provider>
        </Ariakit.Menu>
      </>
    );
  }
);
