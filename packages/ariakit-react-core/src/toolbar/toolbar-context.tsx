import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.js";
import { createStoreContext } from "../utils/system.js";
import type { ToolbarStore } from "./toolbar-store.js";

const ctx = createStoreContext<ToolbarStore>(
  [CompositeContextProvider],
  [CompositeScopedContextProvider],
);

/**
 * Returns the toolbar store from the nearest toolbar container.
 * @example
 * function ToolbarItem() {
 *   const store = useToolbarContext();
 *
 *   if (!store) {
 *     throw new Error("ToolbarItem must be wrapped in ToolbarProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useToolbarContext = ctx.useStoreContext;

export const useToolbarScopedContext = ctx.useScopedStoreContext;

export const useToolbarProviderContext = ctx.useStoreProviderContext;

export const ToolbarContextProvider = ctx.StoreContextProvider;

export const ToolbarScopedContextProvider = ctx.StoreScopedContextProvider;
