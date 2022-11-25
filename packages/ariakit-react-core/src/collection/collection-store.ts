import {
  CollectionStoreItem,
  CollectionStoreState,
  CollectionStore as CoreCollectionStore,
  CollectionStoreProps as CoreCollectionStoreProps,
  createCollectionStore,
} from "@ariakit/core/collection/collection-store";
import { BivariantCallback } from "@ariakit/core/utils/types";
import { Store, useStore, useStoreProps } from "../utils/store";

export function useCollectionStoreOptions<
  T extends CollectionStoreItem = CollectionStoreItem
>(props: CollectionStoreProps<T>) {
  return {
    items: props.items ?? props.getState?.()?.items ?? props.defaultItems,
  };
}

export function useCollectionStoreProps<T extends CollectionStore>(
  store: T,
  props: CollectionStoreProps
) {
  useStoreProps(store, props, "items", "setItems");
  return store;
}

export function useCollectionStore<
  T extends CollectionStoreItem = CollectionStoreItem
>(props: CollectionStoreProps<T> = {}): CollectionStore<T> {
  const options = useCollectionStoreOptions(props);
  let store = useStore(() => createCollectionStore({ ...props, ...options }));

  store = useCollectionStoreProps(store, props);

  return store;
}

export type { CollectionStoreState, CollectionStoreItem };

export type CollectionStore<
  T extends CollectionStoreItem = CollectionStoreItem
> = Store<CoreCollectionStore<T>>;

export type CollectionStoreProps<
  T extends CollectionStoreItem = CollectionStoreItem
> = CoreCollectionStoreProps<T> & {
  defaultItems?: CollectionStoreState<T>["items"];
  setItems?: BivariantCallback<
    (items: CollectionStoreState<T>["items"]) => void
  >;
};
