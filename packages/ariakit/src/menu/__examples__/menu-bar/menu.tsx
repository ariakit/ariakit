import {
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  createContext,
  forwardRef,
  useContext,
} from "react";
import { CompositeInput } from "ariakit/composite";
import {
  MenuBar as BaseMenuBar,
  MenuItem as BaseMenuItem,
  MenuItemCheckbox as BaseMenuItemCheckbox,
  MenuSeparator as BaseMenuSeparator,
  MenuButton,
  MenuButtonArrow,
  MenuItemCheck,
  Menu as MenuPopover,
  useMenuBarState,
  useMenuState,
} from "ariakit/menu";

const MenuContext = createContext(false);
const MenuBarContext = createContext(false);

export type MenuItemProps = HTMLAttributes<HTMLDivElement> & {
  disabled?: boolean;
  shortcuts?: string;
  icon?: ReactNode;
};

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ shortcuts, icon, ...props }, ref) => {
    return (
      <BaseMenuItem className="menu-item" ref={ref} {...props}>
        {icon}
        <span className="label">{props.children}</span>
        {shortcuts && <span className="shortcuts">{shortcuts}</span>}
      </BaseMenuItem>
    );
  }
);

export type MenuInputProps = InputHTMLAttributes<HTMLInputElement>;

export const MenuInput = forwardRef<HTMLInputElement, MenuInputProps>(
  ({ ...props }, ref) => {
    return (
      <BaseMenuItem
        as={CompositeInput}
        className="menu-item-input"
        ref={ref}
        {...props}
      />
    );
  }
);

export type MenuItemCheckboxProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children: string;
  disabled?: boolean;
  checked?: boolean;
  shortcuts?: string;
};

export const MenuItemCheckbox = forwardRef<
  HTMLDivElement,
  MenuItemCheckboxProps
>(({ shortcuts, ...props }, ref) => {
  return (
    <BaseMenuItemCheckbox
      className="menu-item"
      ref={ref}
      name={props.children}
      {...props}
    >
      <MenuItemCheck />
      <span className="label">{props.children}</span>
      {shortcuts && <span className="shortcuts">{shortcuts}</span>}
    </BaseMenuItemCheckbox>
  );
});

export type MenuSeparatorProps = HTMLAttributes<HTMLHRElement>;

export const MenuSeparator = forwardRef<HTMLHRElement, MenuSeparatorProps>(
  (props, ref) => {
    return (
      <BaseMenuSeparator className="menu-separator" ref={ref} {...props} />
    );
  }
);

export type MenuProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode;
  hasCheckbox?: boolean;
};

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ label, hasCheckbox, children, ...props }, ref) => {
    const isMenuBar = useContext(MenuBarContext);
    const isSubmenu = useContext(MenuContext);
    const menu = useMenuState({
      shift:
        hasCheckbox && !isSubmenu
          ? -20
          : isMenuBar && !isSubmenu
          ? -2
          : isSubmenu
          ? -5
          : 0,
    });
    const renderMenuButton = (
      props: HTMLAttributes<HTMLDivElement> & { ref?: Ref<any> }
    ) => (
      <MenuButton state={menu} className="menu-item" {...props}>
        <span className="label">{label}</span>
        {isSubmenu && <MenuButtonArrow />}
      </MenuButton>
    );
    return (
      <>
        {isSubmenu || isMenuBar ? (
          <BaseMenuItem className="menu-item" ref={ref} {...props}>
            {renderMenuButton}
          </BaseMenuItem>
        ) : (
          renderMenuButton({ ref, ...props })
        )}
        <MenuPopover
          portal
          disablePointerEventsOnApproach={isSubmenu}
          state={menu}
          className={`menu${hasCheckbox ? " has-checkbox" : ""}`}
        >
          <MenuContext.Provider value={true}>{children}</MenuContext.Provider>
        </MenuPopover>
      </>
    );
  }
);

export type MenuBarProps = HTMLAttributes<HTMLDivElement>;

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
