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
  useMenuBarState,
  useMenuState,
} from "ariakit/menu";

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
    return (
      <BaseMenuSeparator className="menu-separator" ref={ref} {...props} />
    );
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
    const menu = useMenuState({
      gutter: 8,
      shift: inSubmenu ? -9 : -5,
    });
    return (
      <>
        <MenuButton
          state={menu}
          as={BaseMenuItem}
          className="menu-item"
          ref={ref}
          {...props}
        >
          <span className="label">{label}</span>
          {inSubmenu && <MenuButtonArrow />}
        </MenuButton>
        {menu.mounted && (
          <BaseMenu state={menu} portal className="menu">
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
    const menu = useMenuBarState();
    return (
      <BaseMenuBar state={menu} className="menu-bar" ref={ref} {...props} />
    );
  }
);
