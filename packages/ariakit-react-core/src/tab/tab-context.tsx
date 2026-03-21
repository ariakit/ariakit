import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.tsx";
import { createStoreContext } from "../utils/system.tsx";
import type { TabStore } from "./tab-store.ts";

const ctx = createStoreContext<TabStore>(
  [CompositeContextProvider],
  [CompositeScopedContextProvider],
  "TabProvider",
);

/**
 * Returns the tab store from the nearest tab container.
 * @example
 * function Tab() {
 *   const store = useTabContext();
 *
 *   if (!store) {
 *     throw new Error("Tab must be wrapped in TabProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useTabContext = ctx.useContext;
export const useTabContextStore = ctx.useContextStore;

export const useTabScopedContext = ctx.useScopedContext;
export const useTabScopedContextStore = ctx.useScopedContextStore;

export const useTabProviderContext = ctx.useProviderContext;
export const useTabProviderContextStore = ctx.useProviderContextStore;

export const TabContextProvider = ctx.ContextProvider;

export const TabScopedContextProvider = ctx.ScopedContextProvider;

export const registerTabProvider = ctx.registerProvider;
