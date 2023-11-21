import { createContext } from "react";
import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.js";
import {
  HovercardContextProvider,
  HovercardScopedContextProvider,
} from "../hovercard/hovercard-context.js";
import {
  MenubarContextProvider,
  MenubarScopedContextProvider,
  useMenubarContext,
  useMenubarProviderContext,
  useMenubarScopedContext,
} from "../menubar/menubar-context.js";
import { createStoreContext } from "../utils/system.js";
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
export const useMenuContext = menu.useContext;

export const useMenuScopedContext = menu.useScopedContext;

export const useMenuProviderContext = menu.useProviderContext;

export const MenuContextProvider = menu.ContextProvider;

export const MenuScopedContextProvider = menu.ScopedContextProvider;

/**
 * Returns the menuBar store from the nearest menuBar container.
 * @deprecated
 * Use [`useMenubarContext`](https://ariakit.org/reference/use-menubar-context)
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
