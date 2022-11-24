import {
  CompositeStoreState,
  CompositeStore as CoreCompositeStore,
  CompositeStoreProps as CoreCompositeStoreProps,
  createCompositeStore,
} from "@ariakit/core/composite/composite-store2";
import {
  ParentStore,
  Store,
  useStore,
  useStoreSync,
} from "ariakit-react-utils/store2";
import { SetState } from "ariakit-utils/types";
import { Item } from "./__store-utils";

export function useCompositeStore<T extends Item = Item>(
  props: CompositeStoreProps<T> = {}
): CompositeStore<T> {
  const store = useStore(() =>
    createCompositeStore({
      ...props.getState?.(),
      ...props,
      items: props.items ?? props.getState?.()?.items ?? props.defaultItems,
      activeId:
        props.activeId ?? props.getState?.()?.activeId ?? props.defaultActiveId,
    })
  );

  useStoreSync(store, props, "items", "setItems");
  useStoreSync(store, props, "activeId", "setActiveId");
  useStoreSync(store, props, "includesBaseElement");
  useStoreSync(store, props, "virtualFocus");
  useStoreSync(store, props, "orientation");
  useStoreSync(store, props, "rtl");
  useStoreSync(store, props, "focusLoop");
  useStoreSync(store, props, "focusWrap");
  useStoreSync(store, props, "focusShift");
  useStoreSync(store, props, "moves");

  return store;
}

export type { CompositeStoreState };

export type CompositeStoreProps<T extends Item = Item> =
  CoreCompositeStoreProps<T> &
    ParentStore<CompositeStoreState<T>> & {
      defaultItems?: CompositeStoreState<T>["items"];
      setItems?: SetState<CompositeStoreState<T>["items"]>;
      defaultActiveId?: CompositeStoreState<T>["activeId"];
      setActiveId?: (activeId: CompositeStoreState<T>["activeId"]) => void;
      setMoves?: (moves: CompositeStoreState<T>["moves"]) => void;
    };

export type CompositeStore<T extends Item = Item> = Store<
  CoreCompositeStore<T>
>;
