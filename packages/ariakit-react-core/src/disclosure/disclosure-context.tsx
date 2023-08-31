import { createStoreContext } from "../utils/system.js";
import type { DisclosureStore } from "./disclosure-store.js";

const ctx = createStoreContext<DisclosureStore>();

/**
 * Returns the disclosure store from the nearest disclosure container.
 * @example
 * function Disclosure() {
 *   const store = useDisclosureContext();
 *
 *   if (!store) {
 *     throw new Error("Disclosure must be wrapped in DisclosureProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useDisclosureContext = ctx.useStoreContext;

export const useDisclosureScopedContext = ctx.useScopedStoreContext;

export const useDisclosureProviderContext = ctx.useStoreProviderContext;

export const DisclosureContextProvider = ctx.StoreContextProvider;

export const DisclosureScopedContextProvider = ctx.StoreScopedContextProvider;
