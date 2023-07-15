import * as React from "react";
import * as Ariakit from "@ariakit/react";

// Use React Context so we can determine if the menu is a submenu or a top-level
// menu inside a menu bar.
const MenuContext = React.createContext(false);

export type MenuItemProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  disabled?: boolean;
};

/**
 * MenuItem
 */
export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ label, ...props }, ref) => {
    return (
      <Ariakit.MenuItem className="menu-item" ref={ref} {...props}>
        <span className="label">{label}</span>
      </Ariakit.MenuItem>
    );
  },
);

export type MenuSeparatorProps = React.HTMLAttributes<HTMLHRElement>;

/**
 * MenuSeparator
 */
export const MenuSeparator = React.forwardRef<
  HTMLHRElement,
  MenuSeparatorProps
>((props, ref) => {
  return <Ariakit.MenuSeparator className="separator" ref={ref} {...props} />;
});

export type MenuProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  disabled?: boolean;
};

/**
 * Menu
 */
export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ label, children, ...props }, ref) => {
    const inSubmenu = React.useContext(MenuContext);
    const menu = Ariakit.useMenuStore();
    const mounted = menu.useState("mounted");
    return (
      <>
        <Ariakit.MenuButton
          store={menu}
          ref={ref}
          className="menu-item"
          render={<Ariakit.MenuItem />}
          {...props}
        >
          <span className="label">{label}</span>
          {inSubmenu && <Ariakit.MenuButtonArrow />}
        </Ariakit.MenuButton>
        {mounted && (
          <Ariakit.Menu
            store={menu}
            portal
            gutter={inSubmenu ? 12 : 4}
            overlap={inSubmenu}
            fitViewport={true}
            shift={inSubmenu ? -9 : -2}
            className="menu"
          >
            <MenuContext.Provider value={true}>{children}</MenuContext.Provider>
          </Ariakit.Menu>
        )}
      </>
    );
  },
);

export type MenuBarProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * MenuBar
 */
export const MenuBar = React.forwardRef<HTMLDivElement, MenuBarProps>(
  (props, ref) => {
    const menu = Ariakit.useMenuBarStore();
    return (
      <Ariakit.MenuBar store={menu} className="menu-bar" ref={ref} {...props} />
    );
  },
);
