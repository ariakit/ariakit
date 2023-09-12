import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export interface MenuItemProps extends Ariakit.MenuItemProps {}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    return (
      <Ariakit.MenuItem
        ref={ref}
        {...props}
        className={clsx("menu-item", props.className)}
      />
    );
  },
);

export interface MenuProps extends Ariakit.MenuButtonProps {
  label: React.ReactNode;
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { label, children, ...props },
  ref,
) {
  const menu = Ariakit.useMenuStore();
  return (
    <Ariakit.MenuProvider store={menu}>
      <Ariakit.MenuButton
        ref={ref}
        {...props}
        className={clsx(!menu.parent && "button", props.className)}
        render={menu.parent ? <MenuItem render={props.render} /> : undefined}
      >
        <span className="label">{label}</span>
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      <Ariakit.Menu gutter={8} shift={menu.parent ? -9 : 0} className="menu">
        {children}
      </Ariakit.Menu>
    </Ariakit.MenuProvider>
  );
});
