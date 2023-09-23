import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { createSlotFill } from "@wordpress/components";
import clsx from "clsx";

export const MenuSlotContext = React.createContext<
  Ariakit.MenuStore | undefined
>(undefined);

export interface DropdownMenuItemProps extends Ariakit.MenuItemProps {}

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(function DropdownMenuItem(props, ref) {
  const menuStore = Ariakit.useMenuContext();
  const slotStore = React.useContext(MenuSlotContext);
  return (
    <Ariakit.MenuItem
      ref={ref}
      store={menuStore || slotStore}
      {...props}
      className={clsx("menu-item", props.className)}
    />
  );
});

export interface DropdownMenuProps extends Ariakit.MenuButtonProps {
  label: React.ReactNode;
  modal?: boolean;
  menu?: Ariakit.MenuProps["render"];
}

export const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  function DropdownMenu(
    { label, children, modal = true, menu: renderMenu, ...props },
    ref,
  ) {
    const slotStore = React.useContext(MenuSlotContext);
    const menu = Ariakit.useMenuStore({ parent: slotStore });

    const mounted = menu.useState("mounted");

    const renderButton = menu.parent ? (
      <DropdownMenuItem store={menu.parent} render={props.render} />
    ) : undefined;

    return (
      <>
        <Ariakit.MenuButton
          ref={ref}
          {...props}
          store={menu}
          render={renderButton}
          className={clsx(!menu.parent && "button", props.className)}
        >
          <span className="label">{label}</span>
          <Ariakit.MenuButtonArrow />
        </Ariakit.MenuButton>
        {mounted && (
          <Ariakit.Menu
            portal
            modal={modal}
            store={menu}
            gutter={menu.parent ? 16 : 8}
            shift={menu.parent ? -9 : 0}
            className="menu"
            render={renderMenu}
          >
            {children}
          </Ariakit.Menu>
        )}
      </>
    );
  },
);

export function createMenuSlot(name: string, bubblesVirtually = false) {
  const SlotFill = createSlotFill(name);

  const Slot = () => {
    if (!bubblesVirtually) return <SlotFill.Slot />;
    // Provide the menu store to the fills
    const menu = Ariakit.useMenuContext();
    return (
      <SlotFill.Slot bubblesVirtually={bubblesVirtually} fillProps={menu} />
    );
  };

  const Fill = (props: { children: React.ReactNode }) => {
    if (!bubblesVirtually) return <SlotFill.Fill {...props} />;
    return (
      <SlotFill.Fill>
        {(menu: Ariakit.MenuStore) => (
          // Re-create the menu context within the fill tree
          <MenuSlotContext.Provider value={menu}>
            {props.children}
          </MenuSlotContext.Provider>
        )}
      </SlotFill.Fill>
    );
  };

  return { Slot, Fill };
}
