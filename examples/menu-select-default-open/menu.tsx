import * as React from "react";
import * as Ariakit from "@ariakit/react";

interface MenuProps extends Omit<Ariakit.MenuButtonProps, "store"> {
  label?: React.ReactNode;
  open?: Ariakit.MenuStoreProps["open"];
  onToggle?: Ariakit.MenuStoreProps["setOpen"];
}

export const Menu = React.forwardRef<HTMLButtonElement, MenuProps>(
  function Menu({ label, open, onToggle, children, ...props }, ref) {
    const menu = Ariakit.useMenuStore({ open, setOpen: onToggle });
    return (
      <>
        <Ariakit.MenuButton
          ref={ref}
          className="button"
          {...props}
          store={menu}
        >
          {label}
        </Ariakit.MenuButton>
        <Ariakit.Menu store={menu} className="menu">
          {children}
        </Ariakit.Menu>
      </>
    );
  }
);

export const MenuItem = React.forwardRef<HTMLDivElement, Ariakit.MenuItemProps>(
  function MenuItem(props, ref) {
    return <Ariakit.MenuItem ref={ref} className="menu-item" {...props} />;
  }
);
