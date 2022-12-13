import * as Core from "@ariakit/core/collection/collection-store";
import { BivariantCallback } from "@ariakit/core/utils/types";
import { Store, useStore, useStoreProps } from "../utils/store";

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

export function useCollectionStore<T extends Item = Item>(
  props: CollectionStoreProps<T> &
    (
      | Required<Pick<CollectionStoreProps<T>, "items">>
      | Required<Pick<CollectionStoreProps<T>, "defaultItems">>
    )
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

export type CollectionStoreOptions<T extends Item = Item> =
  Core.CollectionStoreOptions<T> & {
    setItems?: BivariantCallback<
      (items: CollectionStoreState<T>["items"]) => void
    >;
  };

export type CollectionStoreProps<T extends Item = Item> =
  CollectionStoreOptions<T> & Core.CollectionStoreProps<T>;

export type CollectionStore<T extends Item = Item> =
  CollectionStoreFunctions<T> & Store<Core.CollectionStore<T>>;
