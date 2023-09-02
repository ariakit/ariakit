import { createContext } from "react";
import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.js";
import {
  HovercardContextProvider,
  HovercardScopedContextProvider,
} from "../hovercard/hovercard-context.js";
import { createStoreContext } from "../utils/system.js";
import type { MenuBarStore } from "./menu-bar-store.js";
import type { MenuStore } from "./menu-store.js";

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
export const useMenuContext = menu.useStoreContext;

export const useMenuScopedContext = menu.useScopedStoreContext;

export const useMenuProviderContext = menu.useStoreProviderContext;

export const MenuContextProvider = menu.StoreContextProvider;

export const MenuScopedContextProvider = menu.StoreScopedContextProvider;

const menubar = createStoreContext<MenuBarStore>(
  [CompositeContextProvider],
  [CompositeScopedContextProvider],
);

/**
 * Returns the menuBar store from the nearest menuBar container.
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
export const useMenuBarContext = menubar.useStoreContext;

export const useMenuBarScopedContext = menubar.useScopedStoreContext;

export const useMenuBarProviderContext = menubar.useStoreProviderContext;

export const MenuBarContextProvider = menubar.StoreContextProvider;

export const MenuBarScopedContextProvider = menubar.StoreScopedContextProvider;

export const MenuItemCheckedContext = createContext<boolean | undefined>(
  undefined,
);
