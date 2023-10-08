import * as React from "react";
import * as Ariakit from "@ariakit/react";
import { createSlotFill } from "@wordpress/components";
import clsx from "clsx";
import { ModalContext } from "./modal.js";

export const MenuContext = React.createContext<
  Ariakit.MenuStore | null | undefined
>(undefined);

export interface MenuItemProps extends Ariakit.MenuItemProps {}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    const store = React.useContext(MenuContext);
    return (
      <Ariakit.MenuItem
        ref={ref}
        store={store || undefined}
        {...props}
        className={clsx("menu-item", props.className)}
      />
    );
  },
);

export interface MenuProps extends Ariakit.MenuButtonProps {
  label: React.ReactNode;
  children?: React.ReactNode;
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { label, children, ...props },
  ref,
) {
  const inModal = React.useContext(ModalContext);
  const parent = React.useContext(MenuContext);
  const menu = Ariakit.useMenuStore({ parent });
  // There are 3 ways Ariakit can identify nested dialogs (including menu
  // popovers):
  //
  // 1. They are nested in the React tree.
  // 2. They are appended to the body element after the parent dialog is opened.
  // 3. They are referenced in the getPersistentElements prop of the parent
  //     dialog.
  //
  // By dynamically mounting the menu popover using the mounted state, we're
  // relying on (2). This ensures parent menus won't close when we interact with
  // nested menus, even when they're not nested in the React tree, which is the
  // case when using the WordPress SlotFill module.
  const mounted = menu.useState("mounted");

  return (
    <>
      <Ariakit.MenuButton
        ref={ref}
        {...props}
        store={menu}
        className={clsx(!menu.parent && "button", props.className)}
        // Passing props.render to MenuItem here is not mandatory, but it's
        // necessary if we want to support the `render` prop on our abstracted
        // Menu component.
        render={menu.parent ? <MenuItem render={props.render} /> : props.render}
      >
        <span className="label">{label}</span>
        <Ariakit.MenuButtonArrow />
      </Ariakit.MenuButton>
      {mounted && (
        // By default, Ariakit portals that are nested in the React tree will be
        // also nested in the DOM tree. This allows us to keep them in the
        // correct order. However, the WordPress Modal component will disable
        // all existing elements in the DOM, including existing portals. So,
        // instead of nesting newly opened menus (that could be inside the
        // modal) in existing portals that could've been disabled by the
        // WordPress Modal, we always append them to the body element.
        <Ariakit.PortalContext.Provider value={globalThis.document?.body}>
          <Ariakit.Menu
            portal
            // Can't display the menu as a modal when it's nested within a
            // WordPress Modal component. Otherwise, clicking outside the menu
            // would also close the WordPress Modal.
            modal={!inModal}
            store={menu}
            overflowPadding={16}
            gutter={menu.parent ? 16 : 8}
            shift={menu.parent ? -9 : 0}
            style={{ zIndex: inModal ? 100 : 50 }}
            className="menu"
            hideOnHoverOutside={false}
            hideOnEscape={(event) => {
              // Avoid passing the Escape keydown event to the WordPress Modal.
              // Otherwise, the WordPress Modal would close when pressing Escape
              // on a nested menu.
              event.stopPropagation();
              return true;
            }}
          >
            <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>
          </Ariakit.Menu>
        </Ariakit.PortalContext.Provider>
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
        {(menu) => (
          // Re-create the menu context within the fill tree
          <MenuContext.Provider value={menu as Ariakit.MenuStore}>
            {props.children}
          </MenuContext.Provider>
        )}
      </SlotFill.Fill>
    );
  };

  return { Slot, Fill };
}
