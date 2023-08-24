import { createContext, useContext } from "react";
import type { ComponentPropsWithoutRef } from "react";
import type { CollectionStore } from "./collection-store.js";

export const CollectionContext = createContext<CollectionStore | undefined>(
  undefined,
);

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
export function useCollectionContext() {
  return useContext(CollectionContext);
}

export function CollectionContextProvider(
  props: ComponentPropsWithoutRef<typeof CollectionContext.Provider>,
) {
  return <CollectionContext.Provider {...props} />;
}
