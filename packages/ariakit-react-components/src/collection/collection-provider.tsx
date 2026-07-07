import type { ProviderComponent } from "@ariakit/react-utils";
import type { PickRequired } from "@ariakit/utils";
import type { ReactElement, ReactNode } from "react";
import {
  CollectionContextProvider,
  createCollectionProvider,
} from "./collection-context.tsx";
import type {
  CollectionStore,
  CollectionStoreItem,
  CollectionStoreProps,
} from "./collection-store.ts";
import { useCollectionStore } from "./collection-store.ts";

export interface CollectionProviderComponent extends ProviderComponent<CollectionStore> {
  <T extends CollectionStoreItem = CollectionStoreItem>(
    props: PickRequired<CollectionProviderProps<T>, "items" | "defaultItems">,
  ): ReactElement;
  (props?: CollectionProviderProps): ReactElement;
}

/**
 * Provides a collection store to
 * [`CollectionItem`](https://ariakit.com/reference/collection-item) components.
 * @see https://ariakit.com/components/collection
 * @example
 * ```jsx
 * <CollectionProvider>
 *   <CollectionItem />
 *   <CollectionItem />
 *   <CollectionItem />
 * </CollectionProvider>
 * ```
 */
export const CollectionProvider: CollectionProviderComponent =
  createCollectionProvider(function CollectionProvider(
    props: CollectionProviderProps = {},
  ) {
    const store = useCollectionStore(props);
    return (
      <CollectionContextProvider value={store}>
        {props.children}
      </CollectionContextProvider>
    );
  });

export interface CollectionProviderProps<
  T extends CollectionStoreItem = CollectionStoreItem,
> extends CollectionStoreProps<T> {
  children?: ReactNode;
}
