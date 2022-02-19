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

export { MenuSeparator } from "ariakit/menu";

const MenuContext = createContext(false);

export type MenuItemProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
};

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ label, ...props }, ref) => {
    return (
      <BaseMenuItem
        className="menu-item"
        ref={ref}
        // focusOnHover={false}
        {...props}
      >
        {label}
      </BaseMenuItem>
    );
  }
);

export type MenuProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
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
          <BaseMenuItem
            className="menu-item"
            // focusOnHover={false}
            ref={ref}
            {...props}
          >
            {renderMenuButton}
          </BaseMenuItem>
        ) : (
          renderMenuButton(props)
        )}
        <MenuPopover portal state={menu} className="menu">
          <MenuContext.Provider value={true}>{children}</MenuContext.Provider>
        </MenuPopover>
      </>
    );
  }
);
