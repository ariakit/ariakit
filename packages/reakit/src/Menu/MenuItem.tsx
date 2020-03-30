import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { getDocument } from "reakit-utils/getDocument";
import {
  unstable_CompositeItemOptions as CompositeItemOptions,
  unstable_CompositeItemHTMLProps as CompositeItemHTMLProps,
  unstable_useCompositeItem as useCompositeItem
} from "../Composite/CompositeItem";
import { isTouchDevice } from "./__utils/isTouchDevice";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuContext } from "./__utils/MenuContext";

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

function getRelatedElement(event: React.MouseEvent) {
  if (event.relatedTarget instanceof Element) {
    return event.relatedTarget;
  }
  return null;
}

function hoveringInside(event: React.MouseEvent) {
  const self = event.currentTarget as HTMLElement;
  const relatedElement = getRelatedElement(event);
  if (!relatedElement) return false;
  return self.contains(relatedElement);
}

function hoveringExpandedMenu(event: React.MouseEvent) {
  const self = event.currentTarget as HTMLElement;
  const relatedElement = getRelatedElement(event);
  if (!relatedElement) return false;
  const document = getDocument(self);
  if (!isExpandedDisclosure(self)) return false;
  const menuId = self.getAttribute("aria-controls");
  const menu = document.getElementById(menuId!);
  return menu?.contains(relatedElement);
}

function hoveringAnotherMenuItem(
  event: React.MouseEvent,
  items: MenuItemOptions["items"]
) {
  return items?.some(item => item.ref.current === event.relatedTarget);
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
    const menu = React.useContext(MenuContext);
    const menuRole = menu && menu.role;

    const onMouseEnter = React.useCallback(
      (event: React.MouseEvent) => {
        if (menuRole === "menubar" || isTouchDevice()) return;
        const self = event.currentTarget as HTMLElement;
        self.focus({ preventScroll: true });
      },
      [menuRole]
    );

    const onMouseLeave = React.useCallback(
      (event: React.MouseEvent) => {
        const self = event.currentTarget as HTMLElement;

        if (hoveringInside(event)) return;
        // If this item is a menu disclosure and mouse is leaving it to focus
        // its respective submenu, we don't want to do anything.
        if (hoveringExpandedMenu(event)) return;
        // On menu bars, hovering out of disclosure doesn't blur it.
        if (isExpandedDisclosure(self) && menuRole === "menubar") return;

        // Blur items on mouse out
        self.blur();

        // Move focus to menu after blurring
        if (
          !hoveringAnotherMenuItem(event, options.items) &&
          !isTouchDevice()
        ) {
          options.move?.(null);
        }
      },
      [menuRole, options.move, options.items]
    );

    return {
      role: "menuitem",
      onMouseEnter: useAllCallbacks(onMouseEnter, htmlOnMouseEnter),
      onMouseLeave: useAllCallbacks(onMouseLeave, htmlOnMouseLeave),
      ...htmlProps
    };
  }
});

export const MenuItem = createComponent({
  as: "button",
  useHook: useMenuItem
});
