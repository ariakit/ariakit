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

type Item = Core.CompositeStoreItem;

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
 * Creates a composite store.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 * <Composite store={composite}>
 *   <CompositeItem>Item</CompositeItem>
 *   <CompositeItem>Item</CompositeItem>
 *   <CompositeItem>Item</CompositeItem>
 * </Composite>
 * ```
 */

export function useCompositeStore<T extends Item = Item>(
  props: PickRequired<CompositeStoreProps<T>, "items" | "defaultItems">,
): CompositeStore<T>;

export function useCompositeStore(props?: CompositeStoreProps): CompositeStore;

export function useCompositeStore(
  props: CompositeStoreProps = {},
): CompositeStore {
  const [store, update] = useStore(Core.createCompositeStore, props);
  return useCompositeStoreProps(store, update, props);
}

export type CompositeStoreItem = Core.CompositeStoreItem;

export interface CompositeStoreState<T extends Item = Item>
  extends Core.CompositeStoreState<T>,
    CollectionStoreState<T> {}

export interface CompositeStoreFunctions<T extends Item = Item>
  extends Core.CompositeStoreFunctions<T>,
    CollectionStoreFunctions<T> {}

export interface CompositeStoreOptions<T extends Item = Item>
  extends Core.CompositeStoreOptions<T>,
    CollectionStoreOptions<T> {
  /**
   * A callback that gets called when the `activeId` state changes.
   * @param activeId The new active id.
   * @example
   * const [activeId, setActiveId] = useState(null);
   * const composite = useCompositeStore({ activeId, setActiveId });
   */
  setActiveId?: (activeId: CompositeStoreState<T>["activeId"]) => void;
}

export type CompositeStoreProps<T extends Item = Item> =
  CompositeStoreOptions<T> & Core.CompositeStoreProps<T>;

export type CompositeStore<T extends Item = Item> = CompositeStoreFunctions<T> &
  Store<Core.CompositeStore<T>>;
