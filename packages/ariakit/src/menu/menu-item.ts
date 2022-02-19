import { MouseEvent, useCallback } from "react";
import { useEventCallback } from "ariakit-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import {
  CompositeHoverOptions,
  useCompositeHover,
} from "../composite/composite-hover";
import {
  CompositeItemOptions,
  useCompositeItem,
} from "../composite/composite-item";
import { MenuBarContext, MenuContext, hasExpandedMenuButton } from "./__utils";
import { MenuBarState } from "./menu-bar-state";
import { MenuState } from "./menu-state";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a menu item.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const state = useMenuState();
 * const undo = useMenuItem({ state });
 * const redo = useMenuItem({ state });
 * <MenuButton state={state}>Edit</MenuButton>
 * <Menu state={state}>
 *   <Role {...undo}>Undo</Role>
 *   <Role {...redo}>Redo</Role>
 * </Menu>
 * ```
 */
export const useMenuItem = createHook<MenuItemOptions>(
  ({
    state,
    hideOnClick = true,
    preventScrollOnKeyDown = true,
    focusOnHover,
    ...props
  }) => {
    // Use MenuBar state as a fallback.
    const menuBarState = useStore(state || MenuBarContext, ["items"]);
    state =
      useStore(state || (MenuContext as any), ["move", "hideAll"]) ||
      menuBarState;

    const onClickProp = useEventCallback(props.onClick);
    const hideMenu = state && "hideAll" in state ? state.hideAll : undefined;
    const isWithinMenu = !!hideMenu;

    const onClick = useCallback(
      (event: MouseEvent<HTMLDivElement>) => {
        onClickProp(event);
        if (event.defaultPrevented) return;
        if (!hideOnClick) return;
        if (!hideMenu) return;
        // If this item is also a menu button, we don't want to hide the menu.
        const popupType = event.currentTarget.getAttribute("aria-haspopup");
        if (popupType === "menu") return;
        hideMenu();
      },
      [onClickProp, hideOnClick, hideMenu]
    );

    props = {
      role: "menuitem",
      ...props,
      onClick,
    };

    props = useCompositeItem({ state, preventScrollOnKeyDown, ...props });

    props = useCompositeHover({
      state,
      ...props,
      focusOnHover: (event) => {
        if (typeof focusOnHover === "function") return focusOnHover(event);
        if (focusOnHover != null) return focusOnHover;
        // The menu container should be focused on mouseleave only if the menu
        // item is inside a menu, not a menu bar.
        if (event.type === "mouseleave") return isWithinMenu;
        if (isWithinMenu) {
          // If the menu item is also a submenu button, we should move actual
          // DOM focus to it so that the submenu will not close when the user
          // moves the cursor back to the menu button.
          if (event.currentTarget.hasAttribute("aria-expanded")) {
            event.currentTarget.focus();
          }
          return true;
        }
        // If the menu item is inside a menu bar, we should move DOM focus to
        // the menu item if there's another expanded menu button inside the menu
        // bar. Without this, the visible menus in the menu bar wouldn't close.
        else if (hasExpandedMenuButton(state?.items, event.currentTarget)) {
          event.currentTarget.focus();
          return true;
        }
        return false;
      },
    });

    return props;
  }
);

/**
 * A component that renders a menu item.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuState();
 * <MenuButton state={menu}>Edit</MenuButton>
 * <Menu state={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const MenuItem = createMemoComponent<MenuItemOptions>((props) => {
  const htmlProps = useMenuItem(props);
  return createElement("div", htmlProps);
});

export type MenuItemOptions<T extends As = "div"> = Omit<
  CompositeItemOptions<T>,
  "state" | "preventScrollOnKeyDown"
> &
  Omit<CompositeHoverOptions<T>, "state"> & {
    /**
     * Object returned by the `useMenuBarState` or `useMenuState` hooks. If not
     * provided, the parent `Menu` or `MenuBar` components' context will be
     * used.
     */
    state?: MenuBarState | MenuState;
    /**
     * Whether to hide the menu when the menu item is clicked.
     * @default true
     */
    hideOnClick?: boolean;
    /**
     * Whether the scroll behavior should be prevented when pressing arrow keys
     * on the first or the last items.
     * @default true
     */
    preventScrollOnKeyDown?: CompositeItemOptions["preventScrollOnKeyDown"];
  };

export type MenuItemProps<T extends As = "div"> = Props<MenuItemOptions<T>>;
