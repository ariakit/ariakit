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
export const useDisclosureContext = ctx.useContext;

export const useDisclosureScopedContext = ctx.useScopedContext;

export const useDisclosureProviderContext = ctx.useProviderContext;

export const DisclosureContextProvider = ctx.ContextProvider;

export const DisclosureScopedContextProvider = ctx.ScopedContextProvider;
