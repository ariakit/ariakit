import {
  DialogContextProvider,
  DialogScopedContextProvider,
} from "../dialog/dialog-context.tsx";
import { createStoreContext } from "../utils/system.tsx";
import type { PopoverStore } from "./popover-store.ts";

const ctx = createStoreContext<PopoverStore>(
  "PopoverProvider",
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
export const usePopoverContext = ctx.useContext;
export const usePopoverContextStore = ctx.useContextStore;

export const usePopoverScopedContext = ctx.useScopedContext;
export const usePopoverScopedContextStore = ctx.useScopedContextStore;

export const usePopoverProviderContext = ctx.useProviderContext;
export const usePopoverProviderContextStore = ctx.useProviderContextStore;

export const PopoverContextProvider = ctx.ContextProvider;

export const PopoverScopedContextProvider = ctx.ScopedContextProvider;

export const registerPopoverProvider = ctx.registerProvider;
