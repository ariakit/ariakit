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

export function useCompositeStore<T extends Item = Item>(
  props: CompositeStoreProps<T> = {}
): CompositeStore<T> {
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
      defaultActiveId?: CompositeStoreState<T>["activeId"];
      setActiveId?: (activeId: CompositeStoreState<T>["activeId"]) => void;
      setMoves?: (moves: CompositeStoreState<T>["moves"]) => void;
    };

export type CompositeStoreProps<T extends Item = Item> =
  CompositeStoreOptions<T> & Core.CompositeStoreProps<T>;

export type CompositeStore<T extends Item = Item> = CompositeStoreFunctions<T> &
  Store<Core.CompositeStore<T>>;
