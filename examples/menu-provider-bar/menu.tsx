import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { useMenuContext } from "@ariakit/react-core/menu/menu-context";

export { MenuBarProvider } from "@ariakit/react-core/menu/menu-bar-provider";
export { MenuProvider } from "@ariakit/react-core/menu/menu-provider";

export const MenuBar = React.forwardRef<HTMLDivElement, Ariakit.MenuBarProps>(
  function MenuBar(props, ref) {
    return <Ariakit.MenuBar ref={ref} className="menu-bar" {...props} />;
  },
);

export const Menu = React.forwardRef<HTMLDivElement, Ariakit.MenuProps>(
  function Menu(props, ref) {
    const menu = useMenuContext();

    if (!menu) {
      throw new Error("Menu must be used within a MenuProvider");
    }

    const mounted = menu.useState("mounted");
    if (!mounted) return null;

    return (
      <Ariakit.Menu
        ref={ref}
        portal
        overlap={!!menu.parent}
        gutter={menu.parent ? 12 : 4}
        shift={menu.parent ? -9 : -2}
        fitViewport
        className="menu"
        {...props}
      />
    );
  },
);

interface MenuButtonProps extends Ariakit.MenuButtonProps {
  children?: React.ReactNode;
}

export const MenuButton = React.forwardRef<HTMLDivElement, MenuButtonProps>(
  function MenuButton(props, ref) {
    const menu = useMenuContext();
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
    return <Ariakit.MenuItem className="menu-item" ref={ref} {...props} />;
  },
);

export const MenuSeparator = React.forwardRef<
  HTMLHRElement,
  Ariakit.MenuSeparatorProps
>(function MenuSeparator(props, ref) {
  return <Ariakit.MenuSeparator className="separator" ref={ref} {...props} />;
});
