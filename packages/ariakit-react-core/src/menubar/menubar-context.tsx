import { createContext } from "react";
import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.tsx";
import { createStoreContext } from "../utils/system.tsx";
import type { MenubarStore } from "./menubar-store.ts";

const menubar = createStoreContext<MenubarStore>(
  [CompositeContextProvider],
  [CompositeScopedContextProvider],
  "MenubarProvider",
);

/**
 * Returns the menubar store from the nearest menubar container.
 * @example
 * function Menubar() {
 *   const store = useMenubarContext();
 *
 *   if (!store) {
 *     throw new Error("Menubar must be wrapped in MenubarProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useMenubarContext = menubar.useContext;
export const useMenubarContextStore = menubar.useContextStore;

export const useMenubarScopedContext = menubar.useScopedContext;
export const useMenubarScopedContextStore = menubar.useScopedContextStore;

export const useMenubarProviderContext = menubar.useProviderContext;
export const useMenubarProviderContextStore = menubar.useProviderContextStore;

export const MenubarContextProvider = menubar.ContextProvider;

export const MenubarScopedContextProvider = menubar.ScopedContextProvider;

export const registerMenubarProvider = menubar.registerProvider;

export const MenuItemCheckedContext = createContext<boolean | undefined>(
  undefined,
);
