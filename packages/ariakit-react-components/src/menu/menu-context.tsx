import { createStoreContext } from "@ariakit/react-utils";
import { createContext } from "react";
import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.tsx";
import {
  HovercardContextProvider,
  HovercardScopedContextProvider,
} from "../hovercard/hovercard-context.tsx";
import {
  MenubarContextProvider,
  MenubarScopedContextProvider,
  useMenubarContext,
  useMenubarProviderContext,
  useMenubarScopedContext,
} from "../menubar/menubar-context.tsx";
import type { MenuStore } from "./menu-store.ts";

const menu = createStoreContext<MenuStore>(
  [CompositeContextProvider, HovercardContextProvider],
  [CompositeScopedContextProvider, HovercardScopedContextProvider],
);

/**
 * Returns the menu store from the nearest menu container.
 * @example
 * function Menu() {
 *   const store = useMenuContext();
 *
 *   if (!store) {
 *     throw new Error("Menu must be wrapped in MenuProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useMenuContext = menu.useContext;

export const useMenuScopedContext = menu.useScopedContext;

export const useMenuProviderContext = menu.useProviderContext;

export const MenuContextProvider = menu.ContextProvider;

export const MenuScopedContextProvider = menu.ScopedContextProvider;

/**
 * Returns the menuBar store from the nearest menuBar container.
 * @deprecated
 * Use [`useMenubarContext`](https://ariakit.com/reference/use-menubar-context)
 * instead.
 * @example
 * function MenuBar() {
 *   const store = useMenuBarContext();
 *
 *   if (!store) {
 *     throw new Error("MenuBar must be wrapped in MenuBarProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useMenuBarContext = useMenubarContext;

export const useMenuBarScopedContext = useMenubarScopedContext;

export const useMenuBarProviderContext = useMenubarProviderContext;

export const MenuBarContextProvider = MenubarContextProvider;

export const MenuBarScopedContextProvider = MenubarScopedContextProvider;

export const MenuItemCheckedContext = createContext<boolean | undefined>(
  undefined,
);

/**
 * Whether the enclosing menu list is currently hidden (e.g. a closed menu
 * rendered without `unmountOnHide`). `MenuItem` uses it to skip registering
 * items that aren't shown yet. Defaults to `false` so items without a menu list
 * ancestor (such as menubar items) keep registering.
 */
export const MenuListHiddenContext = createContext(false);
