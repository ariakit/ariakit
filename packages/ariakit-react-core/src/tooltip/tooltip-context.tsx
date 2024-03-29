import {
  HovercardContextProvider,
  HovercardScopedContextProvider,
} from "../hovercard/hovercard-context.tsx";
import { createStoreContext } from "../utils/system.tsx";
import type { TooltipStore } from "./tooltip-store.ts";

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
export const useTooltipContext = ctx.useContext;

export const useTooltipScopedContext = ctx.useScopedContext;

export const useTooltipProviderContext = ctx.useProviderContext;

export const TooltipContextProvider = ctx.ContextProvider;

export const TooltipScopedContextProvider = ctx.ScopedContextProvider;
