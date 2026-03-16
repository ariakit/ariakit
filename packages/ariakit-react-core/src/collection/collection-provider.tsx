import type { PickRequired } from "@ariakit/core/utils/types";
import type { ReactElement, ReactNode } from "react";
import { CollectionContextProvider } from "./collection-context.tsx";
import type {
  CollectionStoreItem,
  CollectionStoreProps,
} from "./collection-store.ts";
import { useCollectionStore } from "./collection-store.ts";

/**
 * Provides a collection store to
 * [`CollectionItem`](https://ariakit.org/reference/collection-item) components.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * <CollectionProvider>
 *   <CollectionItem />
 *   <CollectionItem />
 *   <CollectionItem />
 * </CollectionProvider>
 * ```
 */

export function CollectionProvider<
  T extends CollectionStoreItem = CollectionStoreItem,
>(
  props: PickRequired<CollectionProviderProps<T>, "items" | "defaultItems">,
): ReactElement;

export function CollectionProvider(
  props?: CollectionProviderProps,
): ReactElement;

export function CollectionProvider(props: CollectionProviderProps = {}) {
  const store = useCollectionStore(props);
  return (
    <CollectionContextProvider value={store}>
      {props.children}
    </CollectionContextProvider>
  );
}

export interface CollectionProviderProps<
  T extends CollectionStoreItem = CollectionStoreItem,
> extends CollectionStoreProps<T> {
  children?: ReactNode;
}
