import {
  HTMLAttributes,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
} from "react";
import {
  Menu as BaseMenu,
  MenuBar as BaseMenuBar,
  MenuItem as BaseMenuItem,
  MenuSeparator as BaseMenuSeparator,
  MenuButton,
  MenuButtonArrow,
  useMenuBarStore,
  useMenuStore,
} from "ariakit/menu/store";

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
      <BaseMenuItem className="menu-item" ref={ref} {...props}>
        <span className="label">{label}</span>
      </BaseMenuItem>
    );
  }
);

export type MenuSeparatorProps = HTMLAttributes<HTMLHRElement>;

/**
 * MenuSeparator
 */
export const MenuSeparator = forwardRef<HTMLHRElement, MenuSeparatorProps>(
  (props, ref) => {
    return <BaseMenuSeparator className="separator" ref={ref} {...props} />;
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
    const menu = useMenuStore({
      gutter: inSubmenu ? 12 : 4,
      overlap: inSubmenu,
      fitViewport: true,
      shift: inSubmenu ? -9 : -2,
    });
    const mounted = menu.useState("mounted");
    return (
      <>
        <MenuButton
          store={menu}
          as={BaseMenuItem}
          className="menu-item"
          ref={ref}
          {...props}
        >
          <span className="label">{label}</span>
          {inSubmenu && <MenuButtonArrow />}
        </MenuButton>
        {mounted && (
          <BaseMenu store={menu} portal className="menu" label={label}>
            <MenuContext.Provider value={true}>{children}</MenuContext.Provider>
          </BaseMenu>
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
    const menu = useMenuBarStore();
    return (
      <BaseMenuBar store={menu} className="menu-bar" ref={ref} {...props} />
    );
  }
);
