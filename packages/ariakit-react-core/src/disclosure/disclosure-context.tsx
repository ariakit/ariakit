import { createStoreContext } from "../utils/system.tsx";
import type { DisclosureStore } from "./disclosure-store.ts";

const ctx = createStoreContext<DisclosureStore>([], [], "DisclosureProvider");

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
export const useDisclosureContextStore = ctx.useContextStore;

export const useDisclosureScopedContext = ctx.useScopedContext;
export const useDisclosureScopedContextStore = ctx.useScopedContextStore;

export const useDisclosureProviderContext = ctx.useProviderContext;
export const useDisclosureProviderContextStore = ctx.useProviderContextStore;

export const DisclosureContextProvider = ctx.ContextProvider;

export const DisclosureScopedContextProvider = ctx.ScopedContextProvider;

export const registerDisclosureProvider = ctx.registerProvider;
