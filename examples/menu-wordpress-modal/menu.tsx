import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { createSlotFill } from "@wordpress/components";
import clsx from "clsx";
import { ModalContext } from "./modal.js";

export const MenuSlotContext = React.createContext<
  Ariakit.MenuStore | null | undefined
>(undefined);

export interface MenuItemProps extends Ariakit.MenuItemProps {}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    const menuStore = Ariakit.useMenuContext();
    const slotStore = React.useContext(MenuSlotContext);
    return (
      <Ariakit.MenuItem
        ref={ref}
        // Fall back to the slot store if there is no menu store
        store={menuStore || slotStore || undefined}
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
  const inModal = React.useContext(ModalContext);
  const slotStore = React.useContext(MenuSlotContext);
  const menu = Ariakit.useMenuStore({ parent: slotStore });

  const mounted = menu.useState((state) => !menu.parent || state.mounted);

  const renderButton = menu.parent ? (
    <MenuItem store={menu.parent} render={props.render} />
  ) : (
    props.render
  );

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
          modal={!inModal}
          store={menu}
          overflowPadding={16}
          gutter={menu.parent ? 16 : 8}
          shift={menu.parent ? -9 : 0}
          style={{ zIndex: inModal ? 100 : 50 }}
          className="menu"
          hideOnHoverOutside={false}
          hideOnEscape={(event) => {
            event.stopPropagation();
            return true;
          }}
        >
          {children}
        </Ariakit.Menu>
      )}
    </>
  );
});

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
