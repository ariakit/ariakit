import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { getDocument } from "reakit-utils/getDocument";
import { contains } from "reakit-utils/contains";
import {
  unstable_CompositeItemOptions as CompositeItemOptions,
  unstable_CompositeItemHTMLProps as CompositeItemHTMLProps,
  unstable_useCompositeItem as useCompositeItem,
} from "../Composite/CompositeItem";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuRoleContext } from "./__utils/MenuContext";

export type MenuItemOptions = CompositeItemOptions &
  Pick<Partial<MenuStateReturn>, "visible" | "hide" | "placement"> &
  Pick<MenuStateReturn, "next" | "previous" | "move">;

export type MenuItemHTMLProps = CompositeItemHTMLProps;

export type MenuItemProps = MenuItemOptions & MenuItemHTMLProps;

function isExpandedDisclosure(element: HTMLElement) {
  return (
    element.hasAttribute("aria-controls") &&
    element.getAttribute("aria-expanded") === "true"
  );
}

function getMouseDestination(event: React.MouseEvent<HTMLElement, MouseEvent>) {
  const relatedTarget = event.relatedTarget as Node | null;
  if (relatedTarget?.nodeType === Node.ELEMENT_NODE) {
    return event.relatedTarget;
  }
  return (event as any).toElement || null;
}

function hoveringInside(event: React.MouseEvent<HTMLElement, MouseEvent>) {
  const nextElement = getMouseDestination(event);
  if (!nextElement) return false;
  return contains(event.currentTarget, nextElement);
}

function hoveringExpandedMenu(
  event: React.MouseEvent<HTMLElement, MouseEvent>
) {
  const self = event.currentTarget;
  const nextElement = getMouseDestination(event);
  if (!nextElement) return false;
  const document = getDocument(self);
  if (!isExpandedDisclosure(self)) return false;
  const menuId = self.getAttribute("aria-controls");
  const menu = document.getElementById(menuId!);
  if (!menu) return false;
  return contains(menu, nextElement);
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
      onMouseLeave: htmlOnMouseLeave,
      ...htmlProps
    }
  ) {
    const menuRole = React.useContext(MenuRoleContext);

    const onMouseEnter = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      htmlOnMouseEnter?.(event);
      if (event.defaultPrevented || menuRole === "menubar") return;
      event.currentTarget.focus();
    };

    const onMouseLeave = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      htmlOnMouseLeave?.(event);
      if (event.defaultPrevented) return;

      const self = event.currentTarget;

      if (hoveringInside(event)) return;
      // If this item is a menu disclosure and mouse is leaving it to focus
      // its respective submenu, we don't want to do anything.
      if (hoveringExpandedMenu(event)) return;
      // On menu bars, hovering out of disclosure doesn't blur it.
      if (menuRole === "menubar" && isExpandedDisclosure(self)) return;

      // Move focus to menu after blurring
      if (!hoveringAnotherMenuItem(event, options.items)) {
        options.move?.(null);
      }
    };

    return {
      role: "menuitem",
      onMouseEnter,
      onMouseLeave,
      ...htmlProps,
    };
  },
});

export const MenuItem = createComponent({
  as: "button",
  useHook: useMenuItem,
});
