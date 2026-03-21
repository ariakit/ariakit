import { createStoreContext } from "../utils/system.tsx";
import type { CollectionStore } from "./collection-store.ts";

const ctx = createStoreContext<CollectionStore>("CollectionProvider");

/**
 * Returns the collection store from the nearest collection container.
 * @example
 * function CollectionItem() {
 *   const store = useCollectionContext();
 *
 *   if (!store) {
 *     throw new Error("CollectionItem must be wrapped in CollectionProvider");
 *   }
 *
 *   // Use the store...
 * }
 */
export const useCollectionContext = ctx.useContext;
export const useCollectionContextStore = ctx.useContextStore;

export const useCollectionScopedContext = ctx.useScopedContext;
export const useCollectionScopedContextStore = ctx.useScopedContextStore;

export const useCollectionProviderContext = ctx.useProviderContext;
export const useCollectionProviderContextStore = ctx.useProviderContextStore;

export const CollectionContextProvider = ctx.ContextProvider;

export const CollectionScopedContextProvider = ctx.ScopedContextProvider;

export const registerCollectionProvider = ctx.registerProvider;
