import {
  CompositeState,
  CompositeStoreItem,
  CompositeStore as CoreCompositeStore,
  CompositeStoreProps as CoreCompositeStoreProps,
  createCompositeStore,
} from "@ariakit/core/composite/composite-store";
import {
  CollectionStoreProps,
  getCollectionDefaultState,
  useCollectionStoreProps,
} from "../collection/collection-store";
import { Store, useStore, useStoreProps } from "../utils/store";

export function getCompositeDefaultState<
  T extends CompositeStoreItem = CompositeStoreItem
>(props: CompositeStoreProps<T>) {
  return {
    ...getCollectionDefaultState(props),
    activeId: props.defaultActiveId,
  };
}

export function useCompositeStoreProps<
  T extends CompositeStore<I>,
  I extends CompositeStoreItem
>(store: T, props: CompositeStoreProps<I>) {
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
  let store = useStore(() =>
    createCompositeStore({ ...props, ...getCompositeDefaultState(props) })
  );
  store = useCompositeStoreProps(store, props);
  return store;
}

export type { CompositeState, CompositeStoreItem };

export type CompositeStore<T extends CompositeStoreItem = CompositeStoreItem> =
  Store<CoreCompositeStore<T>>;

export type CompositeStoreProps<
  T extends CompositeStoreItem = CompositeStoreItem
> = CollectionStoreProps<T> &
  CoreCompositeStoreProps<T> & {
    defaultActiveId?: CompositeState<T>["activeId"];
    setActiveId?: (activeId: CompositeState<T>["activeId"]) => void;
    setMoves?: (moves: CompositeState<T>["moves"]) => void;
  };
