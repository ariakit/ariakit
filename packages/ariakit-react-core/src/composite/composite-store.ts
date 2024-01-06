import * as Core from "@ariakit/core/composite/composite-store";
import type { PickRequired } from "@ariakit/core/utils/types";
import type {
  CollectionStoreFunctions,
  CollectionStoreOptions,
  CollectionStoreState,
} from "../collection/collection-store.js";
import { useCollectionStoreProps } from "../collection/collection-store.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useCompositeStoreProps<T extends Core.CompositeStore>(
  store: T,
  update: () => void,
  props: CompositeStoreProps,
) {
  store = useCollectionStoreProps(store, update, props);
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

/**
 * Creates a composite store to control the state of
 * [Composite](https://ariakit.org/components/composite) components.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 *
 * <Composite store={composite}>
 *   <CompositeItem>Item</CompositeItem>
 *   <CompositeItem>Item</CompositeItem>
 *   <CompositeItem>Item</CompositeItem>
 * </Composite>
 * ```
 */

export function useCompositeStore<
  T extends CompositeStoreItem = CompositeStoreItem,
>(
  props: PickRequired<CompositeStoreProps<T>, "items" | "defaultItems">,
): CompositeStore<T>;

export function useCompositeStore(props?: CompositeStoreProps): CompositeStore;

export function useCompositeStore(
  props: CompositeStoreProps = {},
): CompositeStore {
  const [store, update] = useStore(Core.createCompositeStore, props);
  return useCompositeStoreProps(store, update, props);
}

export interface CompositeStoreItem extends Core.CompositeStoreItem {}

export interface CompositeStoreState<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends Core.CompositeStoreState<T>,
    CollectionStoreState<T> {}

export interface CompositeStoreFunctions<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends Core.CompositeStoreFunctions<T>,
    CollectionStoreFunctions<T> {}

export interface CompositeStoreOptions<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends Core.CompositeStoreOptions<T>,
    CollectionStoreOptions<T> {
  /**
   * A callback that gets called when the
   * [`activeId`](https://ariakit.org/reference/composite-provider#activeid)
   * state changes.
   *
   * Live examples:
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   */
  setActiveId?: (activeId: CompositeStoreState<T>["activeId"]) => void;
}

export interface CompositeStoreProps<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends CompositeStoreOptions<T>,
    Core.CompositeStoreProps<T> {}

export interface CompositeStore<
  T extends CompositeStoreItem = CompositeStoreItem,
> extends CompositeStoreFunctions<T>,
    Store<Core.CompositeStore<T>> {}
