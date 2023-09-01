import {
  PopoverContextProvider,
  PopoverScopedContextProvider,
} from "../popover/popover-context.js";
import { createStoreContext } from "../utils/system.js";
import type { HovercardStore } from "./hovercard-store.js";

const ctx = createStoreContext<HovercardStore>(
  [PopoverContextProvider],
  [PopoverScopedContextProvider],
);

/**
 * Returns the hovercard store from the nearest hovercard container.
 * @example
 * function Hovercard() {
 *   const store = useHovercardContext();
 *
 *   if (!store) {
 *     throw new Error("Hovercard must be wrapped in HovercardProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useHovercardContext = ctx.useStoreContext;

export const useHovercardScopedContext = ctx.useScopedStoreContext;

export const useHovercardProviderContext = ctx.useStoreProviderContext;

export const HovercardContextProvider = ctx.StoreContextProvider;

export const HovercardScopedContextProvider = ctx.StoreScopedContextProvider;
