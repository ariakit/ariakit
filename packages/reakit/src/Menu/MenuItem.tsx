import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
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

export const useMenuItem = createHook<MenuItemOptions, MenuItemHTMLProps>({
  name: "MenuItem",
  compose: useCompositeItem,
  useState: useMenuState,

  useProps(
    options,
    { onMouseOver: htmlOnMouseOver, onMouseOut: htmlOnMouseOut, ...htmlProps }
  ) {
    const menu = React.useContext(MenuContext);
    const menuRole = menu && menu.role;

    const onMouseOver = React.useCallback(
      (event: React.MouseEvent) => {
        if (!event.currentTarget) return;
        if (isTouchDevice()) return;
        if (menuRole === "menubar") return;

        const self = event.currentTarget as HTMLElement;
        self.focus();
      },
      [menuRole]
    );

    const onMouseOut = React.useCallback(
      (event: React.MouseEvent) => {
        if (!event.currentTarget) return;

        const self = event.currentTarget as HTMLElement;

        // Blur items on mouse out
        // Ignore disclosure, otherwise sub menu will close when blurring
        if (
          !self.hasAttribute("aria-controls") ||
          self.getAttribute("aria-expanded") !== "true"
        ) {
          self.blur();
        }

        // Move focus onto menu after blurring
        if (
          (document.activeElement === document.body ||
            options.virtual === "aria-activedescendant") &&
          !isTouchDevice()
        ) {
          options.setCurrentId(null);
        }
      },
      [options.setCurrentId]
    );

    return {
      role: "menuitem",
      onMouseOver: useAllCallbacks(onMouseOver, htmlOnMouseOver),
      onMouseOut: useAllCallbacks(onMouseOut, htmlOnMouseOut),
      ...htmlProps
    };
  }
});

export const MenuItem = createComponent({
  as: "button",
  useHook: useMenuItem
});
