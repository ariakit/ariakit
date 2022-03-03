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
  MenuBar as BaseMenuBar,
  MenuItem as BaseMenuItem,
  MenuSeparator as BaseMenuSeparator,
  MenuButton,
  MenuButtonArrow,
  useMenuBarState,
  useMenuState,
} from "ariakit/menu";

const MenuContext = createContext(false);
const MenuBarContext = createContext(false);

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

type MenuButtonProps = HTMLAttributes<HTMLDivElement> &
  RefAttributes<HTMLDivElement>;

/**
 * Menu
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ label, children, ...props }, ref) => {
    const inMenuBar = useContext(MenuBarContext);
    const inSubmenu = useContext(MenuContext);
    const menu = useMenuState({
      gutter: 8,
      shift: inMenuBar && !inSubmenu ? -5 : inSubmenu ? -9 : 0,
    });

    const renderMenuButton = (props: MenuButtonProps) => (
      <MenuButton state={menu} className="menu-item" {...props}>
        <span className="label">{label}</span>
        {inSubmenu && <MenuButtonArrow />}
      </MenuButton>
    );

    return (
      <>
        {inSubmenu || inMenuBar ? (
          <BaseMenuItem className="menu-item" ref={ref} {...props}>
            {renderMenuButton}
          </BaseMenuItem>
        ) : (
          renderMenuButton({ ref, ...props })
        )}
        {menu.mounted && (
          <BaseMenu portal state={menu} className="menu">
            <MenuContext.Provider value={true}>{children}</MenuContext.Provider>
          </BaseMenu>
        )}
      </>
    );
  }
);

export type MenuBarProps = HTMLAttributes<HTMLDivElement> & {
  values?: Record<string, string | boolean>;
  setValues?: (values: Record<string, string | boolean>) => void;
};

/**
 * MenuBar
 */
export const MenuBar = forwardRef<HTMLDivElement, MenuBarProps>(
  (props, ref) => {
    const menu = useMenuBarState();
    return (
      <MenuBarContext.Provider value={true}>
        <BaseMenuBar state={menu} className="menu-bar" ref={ref} {...props} />
      </MenuBarContext.Provider>
    );
  }
);
