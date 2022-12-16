import * as Core from "@ariakit/core/composite/composite-store";
import {
  CollectionStoreFunctions,
  CollectionStoreOptions,
  CollectionStoreState,
  useCollectionStoreOptions,
  useCollectionStoreProps,
} from "../collection/collection-store";
import { Store, useStore, useStoreProps } from "../utils/store";

type Item = Core.CompositeStoreItem;

export function useCompositeStoreOptions<T extends Item = Item>(
  props: CompositeStoreProps<T>
) {
  return useCollectionStoreOptions(props);
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
  return store;
}

export function useCompositeStore<T extends Item = Item>(
  props: CompositeStoreProps<T> &
    (
      | Required<Pick<CompositeStoreProps<T>, "items">>
      | Required<Pick<CompositeStoreProps<T>, "defaultItems">>
    )
): CompositeStore<T>;

export function useCompositeStore(props?: CompositeStoreProps): CompositeStore;

export function useCompositeStore(
  props: CompositeStoreProps = {}
): CompositeStore {
  const options = useCompositeStoreOptions(props);
  const store = useStore(() =>
    Core.createCompositeStore({ ...props, ...options })
  );
  return useCompositeStoreProps(store, props);
}

export type CompositeStoreItem = Core.CompositeStoreItem;

export type CompositeStoreState<T extends Item = Item> =
  Core.CompositeStoreState<T> & CollectionStoreState<T>;

export type CompositeStoreFunctions<T extends Item = Item> =
  Core.CompositeStoreFunctions<T> & CollectionStoreFunctions<T>;

export type CompositeStoreOptions<T extends Item = Item> =
  Core.CompositeStoreOptions<T> &
    CollectionStoreOptions<T> & {
      setActiveId?: (activeId: CompositeStoreState<T>["activeId"]) => void;
      setMoves?: (moves: CompositeStoreState<T>["moves"]) => void;
    };

export type CompositeStoreProps<T extends Item = Item> =
  CompositeStoreOptions<T> & Core.CompositeStoreProps<T>;

export type CompositeStore<T extends Item = Item> = CompositeStoreFunctions<T> &
  Store<Core.CompositeStore<T>>;
