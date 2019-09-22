import * as React from "react";
import { createComponent } from "reakit-system/createComponent";
import { createHook } from "reakit-system/createHook";
import { useAllCallbacks } from "reakit-utils/useAllCallbacks";
import { RoverOptions, RoverHTMLProps, useRover } from "../Rover/Rover";
import { isTouchDevice } from "./__utils/isTouchDevice";
import { useMenuState, MenuStateReturn } from "./MenuState";
import { MenuContext } from "./__utils/MenuContext";

export type MenuItemOptions = RoverOptions &
  Pick<Partial<MenuStateReturn>, "visible" | "hide" | "placement"> &
  Pick<MenuStateReturn, "next" | "previous" | "move">;

export type MenuItemHTMLProps = RoverHTMLProps;

export type MenuItemProps = MenuItemOptions & MenuItemHTMLProps;

export const useMenuItem = createHook<MenuItemOptions, MenuItemHTMLProps>({
  name: "MenuItem",
  compose: useRover,
  useState: useMenuState,

  useProps(
    options,
    { onMouseOver: htmlOnMouseOver, onMouseOut: htmlOnMouseOut, ...htmlProps }
  ) {
    const menu = React.useContext(MenuContext);

    const onMouseOver = React.useCallback(
      (event: React.MouseEvent) => {
        if (!event.currentTarget) return;
        if (isTouchDevice()) return;
        if (menu && menu.role === "menubar") return;

        const menuItem = event.currentTarget as HTMLElement;
        menuItem.focus();
      },
      [options.orientation]
    );

    const onMouseOut = React.useCallback(
      (event: React.MouseEvent) => {
        if (!event.currentTarget || !menu) return;

        const menuItem = event.currentTarget as HTMLElement;

        // Blur items on mouse out
        // Ignore disclosure, otherwise sub menu will close when blurring
        if (
          !menuItem.hasAttribute("aria-controls") ||
          menuItem.getAttribute("aria-expanded") !== "true"
        ) {
          menuItem.blur();
        }

        // Move focus onto menu after blurring
        if (
          document.activeElement === document.body &&
          menu.ref.current &&
          !isTouchDevice()
        ) {
          menu.ref.current.focus();
        }
      },
      [options.move]
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
