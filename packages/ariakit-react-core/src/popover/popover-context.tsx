import {
  DialogContextProvider,
  DialogScopedContextProvider,
} from "../dialog/dialog-context.js";
import { createStoreContext } from "../utils/system.js";
import type { PopoverStore } from "./popover-store.js";

const ctx = createStoreContext<PopoverStore>(
  [DialogContextProvider],
  [DialogScopedContextProvider],
);

/**
 * Returns the popover store from the nearest popover container.
 * @example
 * function Popover() {
 *   const store = usePopoverContext();
 *
 *   if (!store) {
 *     throw new Error("Popover must be wrapped in PopoverProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const usePopoverContext = ctx.useStoreContext;

export const usePopoverScopedContext = ctx.useScopedStoreContext;

export const usePopoverProviderContext = ctx.useStoreProviderContext;

export const PopoverContextProvider = ctx.StoreContextProvider;

export const PopoverScopedContextProvider = ctx.StoreScopedContextProvider;
