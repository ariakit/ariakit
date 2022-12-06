import * as Core from "@ariakit/core/collection/collection-store";
import { BivariantCallback } from "@ariakit/core/utils/types";
import { Store, useStore, useStoreProps } from "../utils/store";

type Item = Core.CollectionStoreItem;

export function useCollectionStoreOptions<T extends Item = Item>(
  props: CollectionStoreProps<T>
) {
  const state = props.store?.getState?.();
  return {
    items: props.items ?? state?.items ?? props.defaultItems,
  };
}

export function useCollectionStoreProps<T extends CollectionStore>(
  store: T,
  props: CollectionStoreProps
) {
  useStoreProps(store, props, "items", "setItems");
  return store;
}

export function useCollectionStore<T extends Item = Item>(
  props: CollectionStoreProps<T> = {}
): CollectionStore<T> {
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
    defaultItems?: CollectionStoreState<T>["items"];
    setItems?: BivariantCallback<
      (items: CollectionStoreState<T>["items"]) => void
    >;
  };

export type CollectionStoreProps<T extends Item = Item> =
  CollectionStoreOptions<T> & Core.CollectionStoreProps<T>;

export type CollectionStore<T extends Item = Item> =
  CollectionStoreFunctions<T> & Store<Core.CollectionStore<T>>;
