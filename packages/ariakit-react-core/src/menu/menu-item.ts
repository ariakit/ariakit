import type { MouseEvent } from "react";
import { getDocument, getPopupItemRole } from "@ariakit/core/utils/dom";
import { isDownloading, isOpeningInNewTab } from "@ariakit/core/utils/events";
import { hasFocusWithin } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { CompositeHoverOptions } from "../composite/composite-hover.js";
import { useCompositeHover } from "../composite/composite-hover.js";
import type { CompositeItemOptions } from "../composite/composite-item.js";
import { useCompositeItem } from "../composite/composite-item.js";
import { useBooleanEvent, useEvent } from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { MenuBarStore } from "./menu-bar-store.js";
import {
  useMenuBarScopedContext,
  useMenuScopedContext,
} from "./menu-context.js";
import type { MenuStore, MenuStoreState } from "./menu-store.js";

function menubarHasFocus(
  baseElement?: MenuStoreState["baseElement"],
  items?: MenuStoreState["items"],
  currentTarget?: Element,
) {
  if (!baseElement) return false;
  if (hasFocusWithin(baseElement)) return true;
  const expandedItem = items?.find((item) => {
    if (item.element === currentTarget) return false;
    return item.element?.getAttribute("aria-expanded") === "true";
  });
  const expandedMenuId = expandedItem?.element?.getAttribute("aria-controls");
  if (!expandedMenuId) return false;
  const doc = getDocument(baseElement);
  const expandedMenu = doc.getElementById(expandedMenuId);
  if (!expandedMenu) return false;
  return hasFocusWithin(expandedMenu);
}

/**
 * Returns props to create a `MenuItem` component.
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
    const menuContext = useMenuScopedContext(true);
    const menuBarContext = useMenuBarScopedContext();
    store = store || menuContext || (menuBarContext as any);

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "MenuItem must be wrapped in a MenuList, Menu or MenuBar component",
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
      "contentElement" in state ? state.contentElement : null,
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
        if (isWithinMenu) {
          // If the menu item is also a submenu button, we should move actual
          // DOM focus to it so that the submenu will not close when the user
          // moves the cursor back to the menu button.
          if (event.currentTarget.hasAttribute("aria-expanded")) {
            event.currentTarget.focus();
          }
          return true;
        }
        if (!store) return false;
        const { baseElement, items } = store.getState();
        // If the menu item is inside a menu bar, we should move DOM focus to
        // the menu item if focus is somewhere on the widget. Without this, the
        // open menus in the menu bar wouldn't close.
        if (menubarHasFocus(baseElement, items, event.currentTarget)) {
          event.currentTarget.focus();
          return true;
        }
        return false;
      },
    });

    return props;
  },
);

/**
 * Renders a menu item.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * <MenuProvider>
 *   <MenuButton>Edit</MenuButton>
 *   <Menu>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export const MenuItem = createMemoComponent<MenuItemOptions>((props) => {
  const htmlProps = useMenuItem(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  MenuItem.displayName = "MenuItem";
}

export interface MenuItemOptions<T extends As = "div">
  extends CompositeItemOptions<T>,
    CompositeHoverOptions<T> {
  /**
   * Object returned by the
   * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) or
   * [`useMenuBarStore`](https://ariakit.org/reference/use-menu-bar-store)
   * hooks. If not provided, the closest
   * [`Menu`](https://ariakit.org/reference/menu),
   * [`MenuProvider`](https://ariakit.org/reference/menu-provider),
   * [`MenuBar`](https://ariakit.org/reference/menu-bar), or
   * [`MenuBarProvider`](https://ariakit.org/reference/menu-bar-provider)
   * components' context will be used.
   */
  store?: MenuBarStore | MenuStore;
  /**
   * Whether to hide the menu when the menu item is clicked.
   * @default true
   */
  hideOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
  /**
   * @default true
   */
  preventScrollOnKeyDown?: CompositeItemOptions<T>["preventScrollOnKeyDown"];
}

export type MenuItemProps<T extends As = "div"> = Props<MenuItemOptions<T>>;
