import {
  PopoverContextProvider,
  PopoverScopedContextProvider,
} from "../popover/popover-context.tsx";
import { createStoreContext } from "../utils/system.tsx";
import type { HovercardStore } from "./hovercard-store.ts";

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
export const useHovercardContext = ctx.useContext;

export const useHovercardScopedContext = ctx.useScopedContext;

export const useHovercardProviderContext = ctx.useProviderContext;

export const HovercardContextProvider = ctx.ContextProvider;

export const HovercardScopedContextProvider = ctx.ScopedContextProvider;
