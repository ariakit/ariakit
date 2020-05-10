import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { contains } from "reakit-utils/contains";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { hasFocusWithin } from "reakit-utils/hasFocusWithin";
import {
  unstable_CompositeItemOptions as CompositeItemOptions,
  unstable_CompositeItemHTMLProps as CompositeItemHTMLProps,
  unstable_useCompositeItem as useCompositeItem,
} from "../Composite/CompositeItem";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuContext } from "./__utils/MenuContext";
import { findVisibleSubmenu } from "./__utils/findVisibleSubmenu";
import { useTransitToSubmenu } from "./__utils/useTransitToSubmenu";
import { isExpandedDisclosure } from "./__utils/isExpandedDisclosure";

export type MenuItemOptions = CompositeItemOptions &
  Pick<Partial<MenuStateReturn>, "visible" | "hide" | "placement"> &
  Pick<MenuStateReturn, "next" | "previous" | "move">;

export type MenuItemHTMLProps = CompositeItemHTMLProps;

export type MenuItemProps = MenuItemOptions & MenuItemHTMLProps;

function getMouseDestination(event: React.MouseEvent<HTMLElement, MouseEvent>) {
  const relatedTarget = event.relatedTarget as Node | null;
  if (relatedTarget?.nodeType === Node.ELEMENT_NODE) {
    return event.relatedTarget;
  }
  // IE 11
  return (event as any).toElement || null;
}

function hoveringInside(event: React.MouseEvent<HTMLElement, MouseEvent>) {
  const nextElement = getMouseDestination(event);
  if (!nextElement) return false;
  return contains(event.currentTarget, nextElement);
}

function hoveringExpandedMenu(
  event: React.MouseEvent<HTMLElement, MouseEvent>,
  children?: Array<React.RefObject<HTMLElement>>
) {
  if (!children?.length) return false;
  const nextElement = getMouseDestination(event);
  if (!nextElement) return false;
  const visibleSubmenu = findVisibleSubmenu(children);
  return visibleSubmenu && contains(visibleSubmenu, nextElement);
}

function hoveringAnotherMenuItem(
  event: React.MouseEvent<HTMLElement, MouseEvent>,
  items: MenuItemOptions["items"]
) {
  const nextElement = getMouseDestination(event);
  return items?.some((item) => item.ref.current === nextElement);
}

export const useMenuItem = createHook<MenuItemOptions, MenuItemHTMLProps>({
  name: "MenuItem",
  compose: useCompositeItem,
  useState: useMenuState,

  useProps(
    options,
    {
      onMouseEnter: htmlOnMouseEnter,
      onMouseMove: htmlOnMouseMove,
      onMouseLeave: htmlOnMouseLeave,
      ...htmlProps
    }
  ) {
    const menu = React.useContext(MenuContext);
    const onMouseMoveRef = useLiveRef(htmlOnMouseMove);
    const onMouseLeaveRef = useLiveRef(htmlOnMouseLeave);
    const { onMouseEnter, isMouseInTransitToSubmenu } = useTransitToSubmenu(
      menu,
      htmlOnMouseEnter
    );

    const onMouseMove = React.useCallback(
      (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        onMouseMoveRef.current?.(event);
        if (event.defaultPrevented) return;
        if (menu?.role === "menubar") return;
        if (isMouseInTransitToSubmenu(event)) return;
        if (hasFocusWithin(event.currentTarget)) return;
        event.currentTarget.focus();
      },
      []
    );

    const onMouseLeave = React.useCallback(
      (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        onMouseLeaveRef.current?.(event);
        if (event.defaultPrevented) return;
        const self = event.currentTarget;
        if (hoveringInside(event)) return;
        // If this item is a menu disclosure and mouse is leaving it to focus
        // its respective submenu, we don't want to do anything.
        if (hoveringExpandedMenu(event, menu?.children)) return;
        // On menu bars, hovering out of disclosure doesn't blur it.
        if (menu?.role === "menubar" && isExpandedDisclosure(self)) return;
        // Move focus to menu after blurring
        if (!hoveringAnotherMenuItem(event, options.items)) {
          if (isMouseInTransitToSubmenu(event)) return;
          options.move?.(null);
        }
      },
      [menu?.role, menu?.children, options.items, options.move]
    );

    return {
      role: "menuitem",
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      ...htmlProps,
    };
  },
});

export const MenuItem = createComponent({
  as: "button",
  memo: true,
  useHook: useMenuItem,
});
