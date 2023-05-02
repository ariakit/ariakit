import * as React from "react";
import * as Ariakit from "@ariakit/react";

const MenuContext = React.createContext<Ariakit.MenuStore | null>(null);

type MenuProps = React.PropsWithChildren<{
  open?: boolean;
  onToggle?: (open: boolean) => void;
}>;

export function Menu({ children, open, onToggle }: MenuProps) {
  const menu = Ariakit.useMenuStore({ open, setOpen: onToggle });
  return <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>;
}

type MenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  (props, ref) => {
    const menu = React.useContext(MenuContext);
    if (!menu) throw new Error("MenuButton must be used within a Menu");
    return <Ariakit.MenuButton {...props} ref={ref} store={menu} />;
  }
);

type MenuPopoverProps = React.HTMLAttributes<HTMLDivElement>;

export const MenuPopover = React.forwardRef<HTMLDivElement, MenuPopoverProps>(
  (props, ref) => {
    const menu = React.useContext(MenuContext);
    if (!menu) throw new Error("MenuPopover must be used within a Menu");
    return <Ariakit.Menu {...props} ref={ref} store={menu} portal />;
  }
);

export { MenuItem } from "@ariakit/react";
