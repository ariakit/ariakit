import * as Core from "@ariakit/core/collection/collection-store";
import type {
  BivariantCallback,
  PickRequired,
} from "@ariakit/core/utils/types";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

type Item = Core.CollectionStoreItem;

export function useCollectionStoreOptions<T extends Item = Item>(
  _props: CollectionStoreProps<T>
): Partial<CollectionStoreOptions<T>> {
  return {};
}

export function useCollectionStoreProps<T extends CollectionStore>(
  store: T,
  props: CollectionStoreProps
) {
  useStoreProps(store, props, "items", "setItems");
  return store;
}

/**
 * Creates a collection store.
 * @see https://ariakit.org/components/collection
 * @example
 * ```jsx
 * const collection = useCollectionStore();
 * <Collection store={collection}>
 *   <CollectionItem>Item</CollectionItem>
 *   <CollectionItem>Item</CollectionItem>
 *   <CollectionItem>Item</CollectionItem>
 * </Collection>
 * ```
 */
export function useCollectionStore<T extends Item = Item>(
  props: PickRequired<CollectionStoreProps<T>, "items" | "defaultItems">
): CollectionStore<T>;

export function useCollectionStore(
  props?: CollectionStoreProps
): CollectionStore;

export function useCollectionStore(
  props: CollectionStoreProps = {}
): CollectionStore {
  const options = useCollectionStoreOptions(props);
  const store = useStore(() =>
    Core.createCollectionStore({ ...props, ...options })
  );
  return useCollectionStoreProps(store, props);
}

export type CollectionStoreItem = Core.CollectionStoreItem;

export type CollectionStoreState<T extends Item = Item> =
  Core.CollectionStoreState<T>;

export type CollectionStoreFunctions<T extends Item = Item> =
  Core.CollectionStoreFunctions<T>;

export interface CollectionStoreOptions<T extends Item = Item>
  extends Core.CollectionStoreOptions<T> {
  /**
   * A callback that gets called when the `items` state changes.
   * @param items The new items.
   * @example
   * const [items, setItems] = useState([]);
   * const collection = useCollectionStore({ items, setItems });
   */
  setItems?: BivariantCallback<
    (items: CollectionStoreState<T>["items"]) => void
  >;
}

export interface CollectionStoreProps<T extends Item = Item>
  extends CollectionStoreOptions<T>,
    Core.CollectionStoreProps<T> {}

export interface CollectionStore<T extends Item = Item>
  extends CollectionStoreFunctions<T>,
    Store<Core.CollectionStore<T>> {}
