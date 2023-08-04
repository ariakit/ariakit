import * as React from "react";
import * as Ariakit from "@ariakit/react";
import invariant from "tiny-invariant";

const MenuContext = React.createContext<Ariakit.MenuStore | null>(null);

export interface MenuProviderProps extends Ariakit.MenuStoreProps {
  children?: React.ReactNode;
}

export function MenuProvider({ children, ...props }: MenuProviderProps) {
  const store = Ariakit.useMenuStore(props);
  return <MenuContext.Provider value={store}>{children}</MenuContext.Provider>;
}

export interface MenuButtonProps
  extends Omit<Ariakit.MenuButtonProps, "store"> {}

export const MenuButton = React.forwardRef<HTMLButtonElement, MenuButtonProps>(
  function MenuButton(props, ref) {
    const store = React.useContext(MenuContext);
    invariant(store, "MenuButton must be used within MenuProvider");
    return <Ariakit.MenuButton ref={ref} {...props} store={store} />;
  },
);

export interface MenuProps extends Omit<Ariakit.MenuProps, "store"> {}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  function Menu(props, ref) {
    const store = React.useContext(MenuContext);
    invariant(store, "Menu must be used within MenuProvider");
    return <Ariakit.Menu ref={ref} {...props} store={store} />;
  },
);

export type { MenuItemProps } from "@ariakit/react";
export { MenuItem } from "@ariakit/react";
