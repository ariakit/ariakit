import * as React from "react";
import * as Ariakit from "@ariakit/react";

const MenuContext = React.createContext<Ariakit.MenuStore | null>(null);

interface MenuProps {
  children?: React.ReactNode;
  open?: boolean;
  onToggle?: (open: boolean) => void;
}

export function Menu({ children, open, onToggle }: MenuProps) {
  const menu = Ariakit.useMenuStore({ open, setOpen: onToggle });
  return <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>;
}

type MenuButtonProps = Omit<Ariakit.MenuButtonProps, "store">;

export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  function MenuButton(props, ref) {
    const menu = React.useContext(MenuContext)!;
    return <Ariakit.MenuButton ref={ref} {...props} store={menu} />;
  }
);

type MenuPopoverProps = Omit<Ariakit.MenuProps, "store">;

export const MenuPopover = React.forwardRef<HTMLDivElement, MenuPopoverProps>(
  function MenuPopover(props, ref) {
    const menu = React.useContext(MenuContext)!;
    return <Ariakit.Menu ref={ref} portal {...props} store={menu} />;
  }
);

export { MenuItem } from "@ariakit/react";
