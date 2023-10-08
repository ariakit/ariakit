import * as React from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export { MenuProvider } from "@ariakit/react";

export const MenuBar = React.forwardRef<HTMLDivElement, Ariakit.MenuBarProps>(
  function MenuBar(props, ref) {
    return (
      <Ariakit.MenuBarProvider>
        <Ariakit.MenuBar
          ref={ref}
          {...props}
          className={clsx("menu-bar", props.className)}
        />
      </Ariakit.MenuBarProvider>
    );
  },
);

export const Menu = React.forwardRef<HTMLDivElement, Ariakit.MenuProps>(
  function Menu(props, ref) {
    const menu = Ariakit.useMenuContext();
    if (!menu) {
      throw new Error("Menu must be used within a MenuProvider");
    }
    return (
      <Ariakit.Menu
        ref={ref}
        portal
        overlap={!!menu.parent}
        gutter={menu.parent ? 12 : 4}
        shift={menu.parent ? -9 : -2}
        fitViewport
        unmountOnHide
        {...props}
        className={clsx("menu", props.className)}
      />
    );
  },
);

interface MenuButtonProps extends Ariakit.MenuButtonProps {
  children?: React.ReactNode;
}

export const MenuButton = React.forwardRef<HTMLDivElement, MenuButtonProps>(
  function MenuButton(props, ref) {
    const menu = Ariakit.useMenuContext();
    return (
      <Ariakit.MenuButton ref={ref} {...props}>
        <span className="label">{props.children}</span>
        {!!menu?.parent && <Ariakit.MenuButtonArrow />}
      </Ariakit.MenuButton>
    );
  },
);

export const MenuItem = React.forwardRef<HTMLDivElement, Ariakit.MenuItemProps>(
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

export const MenuSeparator = React.forwardRef<
  HTMLHRElement,
  Ariakit.MenuSeparatorProps
>(function MenuSeparator(props, ref) {
  return (
    <Ariakit.MenuSeparator
      ref={ref}
      {...props}
      className={clsx("separator", props.className)}
    />
  );
});
