import * as Core from "@ariakit/core/composite/composite-store";
import { PickRequired } from "@ariakit/core/utils/types";
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
  props: PickRequired<CompositeStoreProps<T>, "items" | "defaultItems">
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
