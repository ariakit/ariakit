import {
  CompositeStoreItem,
  CompositeStoreState,
  CompositeStore as CoreCompositeStore,
  CompositeStoreProps as CoreCompositeStoreProps,
  createCompositeStore,
} from "@ariakit/core/composite/composite-store";
import { Store as CoreStore } from "@ariakit/core/utils/store";
import {
  CollectionStoreProps,
  useCollectionStoreOptions,
  useCollectionStoreProps,
} from "../collection/collection-store";
import { Store, useStore, useStoreProps } from "../utils/store";

export function useCompositeStoreOptions<
  T extends CompositeStoreItem = CompositeStoreItem
>(props: CompositeStoreProps<T>) {
  return {
    ...useCollectionStoreOptions(props),
    activeId:
      props.activeId ?? props.getState?.().activeId ?? props.defaultActiveId,
  };
}

export function useCompositeStoreProps<T extends CompositeStore>(
  store: T,
  props: CompositeStoreProps
) {
  store = useCollectionStoreProps(store, props);
  useStoreProps(store, props, "activeId", "setActiveId");
  useStoreProps(store, props, "includesBaseElement");
  useStoreProps(store, props, "virtualFocus");
  useStoreProps(store, props, "orientation");
  useStoreProps(store, props, "rtl");
  useStoreProps(store, props, "focusLoop");
  useStoreProps(store, props, "focusWrap");
  useStoreProps(store, props, "focusShift");
  useStoreProps(store, props, "moves");
  return store;
}

export function useCompositeStore<
  T extends CompositeStoreItem = CompositeStoreItem
>(props: CompositeStoreProps<T> = {}): CompositeStore<T> {
  const options = useCompositeStoreOptions(props);
  let store = useStore(() => createCompositeStore({ ...props, ...options }));
  store = useCompositeStoreProps(store, props);
  return store;
}

export type { CompositeStoreState, CompositeStoreItem };

export type CompositeStore<T extends CompositeStoreItem = CompositeStoreItem> =
  Store<CoreCompositeStore<T>>;

export type CompositeStoreProps<
  T extends CompositeStoreItem = CompositeStoreItem
> = Omit<CollectionStoreProps<T>, keyof CoreStore> &
  CoreCompositeStoreProps<T> & {
    defaultActiveId?: CompositeStoreState<T>["activeId"];
    setActiveId?: (activeId: CompositeStoreState<T>["activeId"]) => void;
    setMoves?: (moves: CompositeStoreState<T>["moves"]) => void;
  };
