import "./style.css";
import * as React from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export type { MenuProviderProps } from "@ariakit/react";
export { MenuProvider } from "@ariakit/react";

// This context allows us to set the shift prop on the parent menu component
// from a child component.
const SetShiftContext = React.createContext<Dispatch<SetStateAction<number>>>(
  () => {},
);

export interface MenubarProps extends Ariakit.MenubarProps {
  children?: ReactNode;
}

export const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(
  function Menubar(props, ref) {
    const [shift, setShift] = React.useState(0);
    return (
      <Ariakit.Menubar
        ref={ref}
        {...props}
        className={clsx("menubar", props.className)}
      >
        <SetShiftContext.Provider value={setShift}>
          <Ariakit.MenuProvider animated showTimeout={100} hideTimeout={250}>
            {props.children}
            <Ariakit.Menu
              // This menu component is shared across all menus in the menubar.
              // This enables us to animate the menu position when the user
              // hovers over a menu item.
              portal
              shift={shift}
              tabIndex={-1}
              unmountOnHide
              className={clsx("menu", props.className)}
              // The menu position styles are applied to the menu wrapper, so we
              // need to add a class name to the wrapper for animation.
              wrapperProps={{ className: "menu-wrapper" }}
            >
              <Ariakit.MenuArrow className="menu-arrow" />
            </Ariakit.Menu>
          </Ariakit.MenuProvider>
        </SetShiftContext.Provider>
      </Ariakit.Menubar>
    );
  },
);

export interface MenuProps extends Ariakit.MenuItemProps {
  label: string;
  placement?: Ariakit.MenuStoreProps["placement"];
  children?: ReactNode;
  shift?: number;
  href?: string;
}

export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { shift = 0, placement = "bottom", label, href, children, ...props },
  ref,
) {
  const [menuButton, setMenuButton] = React.useState<HTMLDivElement | null>(
    null,
  );

  const setShift = React.useContext(SetShiftContext);
  // By passing the menu context from the MenuProvider component, which is
  // rendered in the Menubar component above, to our menu store, they'll share
  // the same state. In this way, we can control the parent menu store from
  // within this component.
  const context = Ariakit.useMenuContext();
  const menu = Ariakit.useMenuStore({ store: context });
  // Get the menu element rendered by the parent component (contentElement) and
  // use it as the portal element for this menu's contents.
  const parentMenu = menu.useState("contentElement");
  // Compare the menu button element with the current anchor element set when
  // the menu opens to ascertain whether the menu is open.
  const open = menu.useState(
    (state) => state.mounted && state.anchorElement === menuButton,
  );

  React.useLayoutEffect(() => {
    if (!open) return;
    setShift(shift);
    menu.setState("placement", placement);
  }, [open, setShift, shift, menu, placement]);

  const item = (
    <Ariakit.MenuItem
      ref={ref}
      store={menu.menubar || undefined}
      tabbable
      blurOnHoverEnd={false}
      {...props}
      className={clsx("menubar-item", props.className)}
      render={href ? <a href={href} /> : undefined}
    >
      {label}
    </Ariakit.MenuItem>
  );

  // If there are no children, this means that this menu item is a leaf node in
  // the menubar, and we can render it as a simple menu item.
  if (!children) return item;

  return (
    // By default, nested menu providers will automatically assign the parent
    // menu store. We need to manually set the parent to null in this case
    // because the parent menu provider isn't really a parent menu, but rather
    // an aggregator.
    <Ariakit.MenuProvider store={menu} parent={null}>
      <Ariakit.MenuButton
        ref={setMenuButton}
        showOnHover
        render={item}
        // Always show the menu when the menu button gets keyboard focus. Also,
        // it's necessary to define the disclosure and anchor elements as this
        // menu can have various potential anchor elements.
        onFocusVisible={(event) => {
          menu.setDisclosureElement(event.currentTarget);
          menu.setAnchorElement(event.currentTarget);
          menu.show();
        }}
        // Ensure the menu is always shown, not toggled, when the menu button is
        // clicked. If the menu button is a link, we don't want to show the menu
        // upon clicking, only on hovering or using arrow keys.
        toggleOnClick={() => {
          if (href) return false;
          menu.show();
          return false;
        }}
      />
      {open && (
        // Render this menu's contents into the parent menu.
        <Ariakit.Portal portalElement={parentMenu} className="menu-contents">
          {children}
        </Ariakit.Portal>
      )}
    </Ariakit.MenuProvider>
  );
});

export interface MenuItemProps extends Ariakit.MenuItemProps {
  label: string;
  href?: string;
  description?: string;
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem({ ...props }, ref) {
    const menu = Ariakit.useMenuContext();
    const id = React.useId();
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;
    return (
      <Ariakit.MenuItem
        ref={ref}
        store={menu}
        tabbable
        aria-labelledby={labelId}
        aria-describedby={props.description ? descriptionId : undefined}
        {...props}
        className={clsx("menu-item", props.className)}
        render={props.href ? <a href={props.href} /> : undefined}
      >
        <div id={labelId} className="menu-item-label">
          {props.label}
        </div>
        {props.description && (
          <div id={descriptionId} className="menu-item-description">
            {props.description}
          </div>
        )}
      </Ariakit.MenuItem>
    );
  },
);

export interface MenuGroupProps extends Ariakit.MenuGroupProps {
  label: string;
  children?: ReactNode;
}

export const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>(
  function MenuGroup({ label, ...props }, ref) {
    return (
      <Ariakit.MenuGroup
        ref={ref}
        {...props}
        className={clsx("group", props.className)}
      >
        <Ariakit.MenuGroupLabel className="group-label">
          {label}
        </Ariakit.MenuGroupLabel>
        {props.children}
      </Ariakit.MenuGroup>
    );
  },
);
