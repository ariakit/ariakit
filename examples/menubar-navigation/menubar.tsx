import "./style.css";
import { forwardRef, useEffect, useId } from "react";
import type { ReactNode } from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export interface MenubarProps extends Ariakit.MenuBarProps {
  placement?: Ariakit.MenuProviderProps["placement"];
  children?: ReactNode;
  onOpen?: (label: string) => void;
}

export const Menubar = forwardRef<HTMLDivElement, MenubarProps>(
  function Menubar({ placement = "bottom", onOpen, ...props }, ref) {
    const menu = Ariakit.useMenuStore({
      animated: true,
      hideTimeout: 250,
      placement,
    });
    const mounted = menu.useState("mounted");
    const anchorElement = menu.useState("anchorElement");

    useEffect(() => {
      if (!mounted) return;
      const label = anchorElement?.dataset.label;
      if (!label) return;
      onOpen?.(label);
    }, [mounted, anchorElement]);

    return (
      <Ariakit.Menubar
        ref={ref}
        {...props}
        className={clsx("menubar", props.className)}
      >
        <Ariakit.MenuProvider store={menu}>
          {props.children}
        </Ariakit.MenuProvider>
      </Ariakit.Menubar>
    );
  },
);

export interface MenubarItemProps extends Ariakit.MenuButtonProps {
  label: string;
  href?: string;
  hasPopup?: boolean;
}

export const MenubarItem = forwardRef<HTMLDivElement, MenubarItemProps>(
  function MenubarItem({ label, href, hasPopup, className, ...props }, ref) {
    const menu = Ariakit.useMenuContext();

    const item = (
      <Ariakit.MenuItem
        tabbable
        blurOnHoverEnd={false}
        className={clsx("menubar-item", className)}
        render={href ? <a href={href} /> : undefined}
      >
        {label}
      </Ariakit.MenuItem>
    );

    if (!hasPopup) return item;

    return (
      <Ariakit.MenuButton
        {...props}
        ref={ref}
        showOnHover
        onFocusVisible={(event) => {
          menu?.setAnchorElement(event.currentTarget);
          menu?.setDisclosureElement(event.currentTarget);
          menu?.show();
        }}
        toggleOnClick={() => {
          if (href) return false;
          menu?.show();
          return false;
        }}
        data-label={label}
        render={item}
      />
    );
  },
);

export interface MenubarMenuProps extends Ariakit.MenuProps {
  children?: ReactNode;
}

export const MenubarMenu = forwardRef<HTMLDivElement, MenubarMenuProps>(
  function MenubarMenu({ ...props }, ref) {
    return (
      <Ariakit.Menu
        ref={ref}
        portal
        tabIndex={-1}
        unmountOnHide
        {...props}
        className={clsx("menu", props.className)}
        wrapperProps={{
          ...props.wrapperProps,
          className: clsx("menu-wrapper", props.wrapperProps?.className),
        }}
      >
        <Ariakit.MenuArrow className="menu-arrow" />
        {props.children}
      </Ariakit.Menu>
    );
  },
);

export interface MenubarMenuItemProps extends Ariakit.MenuItemProps {
  label: string;
  href?: string;
  description?: string;
}

export const MenubarMenuItem = forwardRef<HTMLDivElement, MenubarMenuItemProps>(
  function MenubarMenuItem({ ...props }, ref) {
    const id = useId();
    const labelId = `${id}-label`;
    const descriptionId = `${id}-description`;
    return (
      <Ariakit.MenuItem
        ref={ref}
        tabbable
        aria-labelledby={labelId}
        aria-describedby={props.description ? descriptionId : undefined}
        {...props}
        render={props.href ? <a href={props.href} /> : undefined}
        className={clsx("menu-item", props.className)}
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

export interface MenubarMenuGroupProps extends Ariakit.MenuGroupProps {
  label: string;
  children?: ReactNode;
}

export const MenubarMenuGroup = forwardRef<
  HTMLDivElement,
  MenubarMenuGroupProps
>(function MenubarMenuGroup({ label, ...props }, ref) {
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
});
