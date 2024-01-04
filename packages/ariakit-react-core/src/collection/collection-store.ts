import * as Core from "@ariakit/core/collection/collection-store";
import type {
  BivariantCallback,
  PickRequired,
} from "@ariakit/core/utils/types";
import { useUpdateEffect } from "../utils/hooks.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useCollectionStoreProps<T extends Core.CollectionStore>(
  store: T,
  update: () => void,
  props: CollectionStoreProps,
) {
  useUpdateEffect(update, [props.store]);
  useStoreProps(store, props, "items", "setItems");
  return store;
}

/**
 * Creates a collection store to control
 * [Collection](https://ariakit.org/components/collection) components.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const collection = useCollectionStore();
 *
 * <Collection store={collection}>
 *   <CollectionItem>Item</CollectionItem>
 *   <CollectionItem>Item</CollectionItem>
 *   <CollectionItem>Item</CollectionItem>
 * </Collection>
 * ```
 */

export function useCollectionStore<
  T extends CollectionStoreItem = CollectionStoreItem,
>(
  props: PickRequired<CollectionStoreProps<T>, "items" | "defaultItems">,
): CollectionStore<T>;

export function useCollectionStore(
  props?: CollectionStoreProps,
): CollectionStore;

export function useCollectionStore(
  props: CollectionStoreProps = {},
): CollectionStore {
  const [store, update] = useStore(Core.createCollectionStore, props);
  return useCollectionStoreProps(store, update, props);
}

export interface CollectionStoreItem extends Core.CollectionStoreItem {}

export interface CollectionStoreState<
  T extends CollectionStoreItem = CollectionStoreItem,
> extends Core.CollectionStoreState<T> {}

export interface CollectionStoreFunctions<
  T extends CollectionStoreItem = CollectionStoreItem,
> extends Core.CollectionStoreFunctions<T> {}

export interface CollectionStoreOptions<
  T extends CollectionStoreItem = CollectionStoreItem,
> extends Core.CollectionStoreOptions<T> {
  /**
   * A callback that gets called when the
   * [`items`](https://ariakit.org/reference/collection-provider#items) state
   * changes.
   * @example
   * const [items, setItems] = useState([]);
   * const collection = useCollectionStore({ items, setItems });
   */
  setItems?: BivariantCallback<
    (items: CollectionStoreState<T>["items"]) => void
  >;
}

export interface CollectionStoreProps<
  T extends CollectionStoreItem = CollectionStoreItem,
> extends CollectionStoreOptions<T>,
    Core.CollectionStoreProps<T> {}

export interface CollectionStore<
  T extends CollectionStoreItem = CollectionStoreItem,
> extends CollectionStoreFunctions<T>,
    Store<Core.CollectionStore<T>> {}
