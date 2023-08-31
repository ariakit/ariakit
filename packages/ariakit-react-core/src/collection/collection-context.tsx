import { createStoreContext } from "../utils/system.js";
import type { CollectionStore } from "./collection-store.js";

const ctx = createStoreContext<CollectionStore>();

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
export const useCollectionContext = ctx.useStoreContext;

export const useCollectionScopedContext = ctx.useScopedStoreContext;

export const useCollectionProviderContext = ctx.useStoreProviderContext;

export const CollectionContextProvider = ctx.StoreContextProvider;

export const CollectionScopedContextProvider = ctx.StoreScopedContextProvider;
