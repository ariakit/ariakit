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

function isExpandedDisclosure(element: HTMLElement) {
  return (
    element.hasAttribute("aria-controls") &&
    element.getAttribute("aria-expanded") === "true"
  );
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
        if (isTouchDevice() || menuRole === "menubar") return;
        const self = event.currentTarget as HTMLElement;
        self.focus({ preventScroll: true });
      },
      [menuRole]
    );

    const onMouseLeave = React.useCallback(
      (event: React.MouseEvent) => {
        const self = event.currentTarget as HTMLElement;
        const relatedTarget =
          event.relatedTarget instanceof Element
            ? event.relatedTarget
            : undefined;

        // Ignores disclosure, otherwise sub menu will close when blurring
        // TODO
        if (
          (relatedTarget && self.contains(relatedTarget)) ||
          (isExpandedDisclosure(self) &&
            ((relatedTarget &&
              document
                .getElementById(self.getAttribute("aria-controls"))
                ?.contains(relatedTarget)) ||
              menuRole === "menubar"))
        ) {
          return;
        }

        // Blur items on mouse out
        self.blur();

        const hoveringAnotherMenuItem = options.items?.some(
          item => item.ref.current === event.relatedTarget
        );

        // Move focus onto menu after blurring
        if (!hoveringAnotherMenuItem && !isTouchDevice()) {
          options.move?.(null);
        }
      },
      [options.move, menuRole, options.currentId, options.items]
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
