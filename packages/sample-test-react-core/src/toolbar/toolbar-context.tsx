import {
  CompositeContextProvider,
  CompositeScopedContextProvider,
} from "../composite/composite-context.tsx";
import { createStoreContext } from "../utils/system.tsx";
import type { ToolbarStore } from "./toolbar-store.ts";

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
