import * as React from "react";
import * as Ariakit from "@ariakit/react";

// Use React Context so we can determine if the menu is a submenu or not.
const MenuContext = React.createContext(false);

export type MenuItemProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  disabled?: boolean;
};

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ label, ...props }, ref) => {
    return (
      <Ariakit.MenuItem className="menu-item" ref={ref} {...props}>
        {label}
      </Ariakit.MenuItem>
    );
  }
);

export type MenuProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  disabled?: boolean;
};

type MenuButtonProps = React.HTMLAttributes<HTMLDivElement> &
  React.RefAttributes<HTMLDivElement>;

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ label, children, ...props }, ref) => {
    const nested = React.useContext(MenuContext);
    const menu = Ariakit.useMenuStore();

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
        <Ariakit.Menu
          store={menu}
          gutter={8}
          shift={nested ? -9 : 0}
          className="menu"
        >
          <MenuContext.Provider value={true}>{children}</MenuContext.Provider>
        </Ariakit.Menu>
      </>
    );
  }
);
