import "./style.css";
import { forwardRef, useEffect, useId } from "react";
import type { ReactNode } from "react";
import * as Ariakit from "@ariakit/react";
import clsx from "clsx";

export interface HoverMenubarProps extends Ariakit.MenuBarProps {
  placement?: Ariakit.MenuProviderProps["placement"];
  children?: ReactNode;
  onOpen?: (label: string) => void;
}

export const HoverMenubar = forwardRef<HTMLDivElement, HoverMenubarProps>(
  function HoverMenubar({ placement = "bottom", onOpen, ...props }, ref) {
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
      <Ariakit.MenuBarProvider>
        <Ariakit.MenuBar
          ref={ref}
          {...props}
          className={clsx("hover-menubar", props.className)}
        >
          <Ariakit.MenuProvider store={menu}>
            {props.children}
          </Ariakit.MenuProvider>
        </Ariakit.MenuBar>
      </Ariakit.MenuBarProvider>
    );
  },
);

export interface HoverMenubarItemProps extends Ariakit.MenuButtonProps {
  label: string;
  href?: string;
  hasPopup?: boolean;
}

export const HoverMenubarItem = forwardRef<
  HTMLDivElement,
  HoverMenubarItemProps
>(function HoverMenubarItem(
  { label, href, hasPopup, className, ...props },
  ref,
) {
  const menu = Ariakit.useMenuContext();

  const item = (
    <Ariakit.MenuItem
      tabbable
      blurOnHoverEnd={false}
      className={clsx("hover-menubar-item", className)}
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
      toggleOnClick={() => {
        if (!href) {
          menu?.show();
        }
        return false;
      }}
      data-label={label}
      render={item}
    />
  );
});

export interface HoverMenubarMenuProps extends Ariakit.MenuProps {
  children?: ReactNode;
}

export const HoverMenubarMenu = forwardRef<
  HTMLDivElement,
  HoverMenubarMenuProps
>(function HoverMenubarMenu({ ...props }, ref) {
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
});

export interface HoverMenubarMenuItemProps extends Ariakit.MenuItemProps {
  label: string;
  href?: string;
  description?: string;
}

export const HoverMenubarMenuItem = forwardRef<
  HTMLDivElement,
  HoverMenubarMenuItemProps
>(function HoverMenubarMenuItem({ ...props }, ref) {
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
});

export interface HoverMenubarMenuGroupProps extends Ariakit.MenuGroupProps {
  label: string;
  children?: ReactNode;
}

export const HoverMenubarMenuGroup = forwardRef<
  HTMLDivElement,
  HoverMenubarMenuGroupProps
>(function HoverMenubarMenuGroup({ label, ...props }, ref) {
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
