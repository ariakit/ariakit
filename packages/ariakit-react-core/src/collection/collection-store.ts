import {
  CollectionState,
  CollectionStoreItem,
  CollectionStore as CoreCollectionStore,
  CollectionStoreProps as CoreCollectionStoreProps,
  createCollectionStore,
} from "@ariakit/core/collection/collection-store";
import {
  Store,
  useStore,
  useStoreProps,
} from "@ariakit/react-core/utils/store";

export function getCollectionDefaultState<
  T extends CollectionStoreItem = CollectionStoreItem
>(props: CollectionStoreProps<T>) {
  return {
    items: props.items ?? props.getState?.()?.items ?? props.defaultItems,
  };
}

export function useCollectionStoreProps<
  T extends CollectionStore<I>,
  I extends CollectionStoreItem
>(store: T, props: CollectionStoreProps<I>) {
  useStoreProps(store, props, "items", "setItems");
  return store;
}

export function useCollectionStore<
  T extends CollectionStoreItem = CollectionStoreItem
>(props: CollectionStoreProps<T> = {}): CollectionStore<T> {
  let store = useStore(() =>
    createCollectionStore({ ...props, ...getCollectionDefaultState(props) })
  );
  store = useCollectionStoreProps(store, props);
  return store;
}

export type { CollectionState };

export type CollectionStore<
  T extends CollectionStoreItem = CollectionStoreItem
> = Store<CoreCollectionStore<T>>;

export type CollectionStoreProps<
  T extends CollectionStoreItem = CollectionStoreItem
> = CoreCollectionStoreProps<T> & {
  defaultItems?: CollectionState<T>["items"];
  setItems?: (items: CollectionState<T>["items"]) => void;
};
