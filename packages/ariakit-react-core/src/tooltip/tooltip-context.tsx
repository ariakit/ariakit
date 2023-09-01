import {
  HovercardContextProvider,
  HovercardScopedContextProvider,
} from "../hovercard/hovercard-context.js";
import { createStoreContext } from "../utils/system.js";
import type { TooltipStore } from "./tooltip-store.js";

const ctx = createStoreContext<TooltipStore>(
  [HovercardContextProvider],
  [HovercardScopedContextProvider],
);

/**
 * Returns the tooltip store from the nearest tooltip container.
 * @example
 * function Tooltip() {
 *   const store = useTooltipContext();
 *
 *   if (!store) {
 *     throw new Error("Tooltip must be wrapped in TooltipProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useTooltipContext = ctx.useStoreContext;

export const useTooltipScopedContext = ctx.useScopedStoreContext;

export const useTooltipProviderContext = ctx.useStoreProviderContext;

export const TooltipContextProvider = ctx.StoreContextProvider;

export const TooltipScopedContextProvider = ctx.StoreScopedContextProvider;
