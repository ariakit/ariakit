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

export function useCollectionStore(
  props: CollectionStoreProps = {}
): CollectionStore {
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

export type CollectionStoreProps = CoreCollectionStoreProps &
  ParentStore<CollectionStoreState> & {
    defaultItems?: CollectionStoreState["items"];
    setItems?: SetState<CollectionStoreState["items"]>;
  };

export type CollectionStore = Store<CoreCollectionStore>;
