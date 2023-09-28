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
export const useToolbarContext = ctx.useContext;

export const useToolbarScopedContext = ctx.useScopedContext;

export const useToolbarProviderContext = ctx.useProviderContext;

export const ToolbarContextProvider = ctx.ContextProvider;

export const ToolbarScopedContextProvider = ctx.ScopedContextProvider;
