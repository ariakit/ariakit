import { createContext } from "react";
import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.js";
import { createStoreContext } from "../utils/system.js";
import type { MenubarStore } from "./menubar-store.js";

const menubar = createStoreContext<MenubarStore>(
  [CompositeContextProvider],
  [CompositeScopedContextProvider],
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

export const useMenubarScopedContext = menubar.useScopedContext;

export const useMenubarProviderContext = menubar.useProviderContext;

export const MenubarContextProvider = menubar.ContextProvider;

export const MenubarScopedContextProvider = menubar.ScopedContextProvider;

export const MenuItemCheckedContext = createContext<boolean | undefined>(
  undefined,
);
