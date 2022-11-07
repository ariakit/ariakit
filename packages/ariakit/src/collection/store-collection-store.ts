import { useMemo } from "react";
import {
  CollectionStoreState,
  CollectionStore as CoreCollectionStore,
  CollectionStoreProps as CoreCollectionStoreProps,
  createCollectionStore,
} from "ariakit-core/collection/collection-store";
import { useEvent } from "ariakit-react-utils/hooks";
import {
  ParentStore,
  Store,
  useStore,
  useStoreSync,
} from "ariakit-react-utils/store2";
import { SetState } from "ariakit-utils/types";

type Item = {
  id: string;
  element?: HTMLElement | null;
};

export function useCollectionStore<T extends Item = Item>(
  props: CollectionStoreProps<T> = {}
): CollectionStore<T> {
  const store = useStore(() =>
    createCollectionStore({
      items: props.items ?? props.getState?.()?.items ?? props.defaultItems,
    })
  );

  useStoreSync(store, props, "items", "setItems");

  const setItems = useEvent(store.setItems);
  const setRenderedItems = useEvent(store.setRenderedItems);

  return useMemo(() => ({ ...store, setItems, setRenderedItems }), []);
}

export type { CollectionStoreState };

export type CollectionStoreProps<T extends Item = Item> =
  CoreCollectionStoreProps<T> &
    ParentStore<CollectionStoreState<T>> & {
      defaultItems?: CollectionStoreState<T>["items"];
      setItems?: SetState<CollectionStoreState<T>["items"]>;
    };

export type CollectionStore<T extends Item = Item> = Store<
  CoreCollectionStore<T>
>;
