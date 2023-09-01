import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.js";
import { createStoreContext } from "../utils/system.js";
import type { TabStore } from "./tab-store.js";

const ctx = createStoreContext<TabStore>(
  [CompositeContextProvider],
  [CompositeScopedContextProvider],
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
export const useTabContext = ctx.useStoreContext;

export const useTabScopedContext = ctx.useScopedStoreContext;

export const useTabProviderContext = ctx.useStoreProviderContext;

export const TabContextProvider = ctx.StoreContextProvider;

export const TabScopedContextProvider = ctx.StoreScopedContextProvider;
