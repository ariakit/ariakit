import {
  HTMLAttributes,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
} from "react";
import * as Ariakit from "@ariakit/react";

// Use React Context so we can determine if the menu is a submenu or a top-level
// menu inside a menu bar.
const MenuContext = createContext(false);

export type MenuItemProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  disabled?: boolean;
};

/**
 * MenuItem
 */
export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ label, ...props }, ref) => {
    return (
      <Ariakit.MenuItem className="menu-item" ref={ref} {...props}>
        <span className="label">{label}</span>
      </Ariakit.MenuItem>
    );
  }
);

export type MenuSeparatorProps = HTMLAttributes<HTMLHRElement>;

/**
 * MenuSeparator
 */
export const MenuSeparator = forwardRef<HTMLHRElement, MenuSeparatorProps>(
  (props, ref) => {
    return <Ariakit.MenuSeparator className="separator" ref={ref} {...props} />;
  }
);

export type MenuProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  disabled?: boolean;
};

/**
 * Menu
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ label, children, ...props }, ref) => {
    const inSubmenu = useContext(MenuContext);
    const menu = Ariakit.useMenuStore({
      gutter: inSubmenu ? 12 : 4,
      overlap: inSubmenu,
      fitViewport: true,
      shift: inSubmenu ? -9 : -2,
    });
    const mounted = menu.useState("mounted");
    return (
      <>
        <Ariakit.MenuButton
          store={menu}
          as={Ariakit.MenuItem}
          className="menu-item"
          ref={ref}
          {...props}
        >
          <span className="label">{label}</span>
          {inSubmenu && <Ariakit.MenuButtonArrow />}
        </Ariakit.MenuButton>
        {mounted && (
          <Ariakit.Menu store={menu} portal className="menu">
            <MenuContext.Provider value={true}>{children}</MenuContext.Provider>
          </Ariakit.Menu>
        )}
      </>
    );
  }
);

export type MenuBarProps = HTMLAttributes<HTMLDivElement>;

/**
 * MenuBar
 */
export const MenuBar = forwardRef<HTMLDivElement, MenuBarProps>(
  (props, ref) => {
    const menu = Ariakit.useMenuBarStore();
    return (
      <Ariakit.MenuBar store={menu} className="menu-bar" ref={ref} {...props} />
    );
  }
);
