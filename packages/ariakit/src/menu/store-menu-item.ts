import { MouseEvent, useContext } from "react";
import { useBooleanEvent, useEvent } from "ariakit-react-utils/hooks";
import { createMemoComponent } from "ariakit-react-utils/store";
import { useStoreState } from "ariakit-react-utils/store2";
import { createElement, createHook } from "ariakit-react-utils/system";
import { As, Props } from "ariakit-react-utils/types";
import { getPopupItemRole } from "ariakit-utils/dom";
import { isDownloading, isOpeningInNewTab } from "ariakit-utils/events";
import { invariant } from "ariakit-utils/misc";
import { BooleanOrCallback } from "ariakit-utils/types";
import {
  CompositeHoverOptions,
  useCompositeHover,
} from "../composite/store-composite-hover";
import {
  CompositeItemOptions,
  useCompositeItem,
} from "../composite/store-composite-item";
import {
  MenuBarContext,
  MenuContext,
  hasExpandedMenuButton,
} from "./__store-utils";
import { MenuBarStore } from "./store-menu-bar-store";
import { MenuStore } from "./store-menu-store";

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a menu item.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const undo = useMenuItem({ store });
 * const redo = useMenuItem({ store });
 * <MenuButton store={store}>Edit</MenuButton>
 * <Menu store={store}>
 *   <Role {...undo}>Undo</Role>
 *   <Role {...redo}>Redo</Role>
 * </Menu>
 * ```
 */
export const useMenuItem = createHook<MenuItemOptions>(
  ({
    store,
    hideOnClick = true,
    preventScrollOnKeyDown = true,
    focusOnHover,
    ...props
  }) => {
    const menuContext = useContext(MenuContext);
    const menuBarContext = useContext(MenuBarContext);
    store = store || menuContext || (menuBarContext as any);

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "MenuItem must be wrapped in a MenuList, MenuPopover or MenuBar component"
    );

    const onClickProp = props.onClick;
    const hideOnClickProp = useBooleanEvent(hideOnClick);
    const hideMenu = "hideAll" in store ? store.hideAll : undefined;
    const isWithinMenu = !!hideMenu;

    const onClick = useEvent((event: MouseEvent<HTMLDivElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;
      if (isDownloading(event)) return;
      if (isOpeningInNewTab(event)) return;
      if (!hideMenu) return;
      // If this item is also a menu button, we don't want to hide the menu.
      const popupType = event.currentTarget.getAttribute("aria-haspopup");
      if (popupType === "menu") return;
      if (!hideOnClickProp(event)) return;
      hideMenu();
    });

    const contentElement = useStoreState(store, (state) =>
      "contentElement" in state ? state.contentElement : null
    );

    const role = getPopupItemRole(contentElement, "menuitem");

    props = {
      role,
      ...props,
      onClick,
    };

    props = useCompositeItem({ store, preventScrollOnKeyDown, ...props });

    props = useCompositeHover({
      store,
      ...props,
      focusOnHover: (event) => {
        if (typeof focusOnHover === "function") return focusOnHover(event);
        if (focusOnHover != null) return focusOnHover;
        // The menu container should be focused on mouseleave only if the menu
        // item is inside a menu, not a menu bar.
        if (event.type === "mouseleave") return isWithinMenu;
        const state = store?.getState();
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
        // bar. Without this, the open menus in the menu bar wouldn't close.
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
 * const menu = useMenuStore();
 * <MenuButton store={menu}>Edit</MenuButton>
 * <Menu store={menu}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export const MenuItem = createMemoComponent<MenuItemOptions>((props) => {
  const htmlProps = useMenuItem(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuItem.displayName = "MenuItem";
}

export type MenuItemOptions<T extends As = "div"> = Omit<
  CompositeItemOptions<T>,
  "store" | "preventScrollOnKeyDown"
> &
  Omit<CompositeHoverOptions<T>, "store"> & {
    /**
     * Object returned by the `useMenuBarStore` or `useMenuStore` hooks. If not
     * provided, the parent `Menu` or `MenuBar` components' context will be
     * used.
     */
    store?: MenuBarStore | MenuStore;
    /**
     * Whether to hide the menu when the menu item is clicked.
     * @default true
     */
    hideOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
    /**
     * Whether the scroll behavior should be prevented when pressing arrow keys
     * on the first or the last items.
     * @default true
     */
    preventScrollOnKeyDown?: CompositeItemOptions["preventScrollOnKeyDown"];
  };

export type MenuItemProps<T extends As = "div"> = Props<MenuItemOptions<T>>;
