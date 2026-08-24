import * as Core from "@ariakit/components/composite/composite-selectable-store";
import { useStore, useStoreProps } from "@ariakit/react-store";
import type { Store } from "@ariakit/react-store";
import { useUpdateEffect } from "@ariakit/react-utils";
import type { BivariantCallback, PickRequired } from "@ariakit/utils";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "./composite-store.ts";
import {
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "./composite-store.ts";

export function useCompositeSelectableStoreOptions<
  T extends Core.CompositeSelectableStoreOptions,
>(props: T) {
  return useCompositeStoreOptions(props);
}

export function useCompositeSelectableStoreProps<
  T extends Core.CompositeSelectableStore,
>(store: T, update: () => void, props: CompositeSelectableStoreProps) {
  useUpdateEffect(update, [props.rangeDelegate, update]);
  store = useCompositeStoreProps(store, update, props);
  useStoreProps(store, props, "selectedIds", "setSelectedIds");
  useStoreProps(store, props, "selectableMode");
  useStoreProps(store, props, "selectableBehavior");
  return store;
}

/**
 * Creates a selectable composite store.
 * @example
 * ```jsx
 * const store = useCompositeSelectableStore({
 *   defaultSelectedIds: [],
 * });
 * ```
 */
export function useCompositeSelectableStore<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
>(
  props: PickRequired<
    CompositeSelectableStoreProps<T>,
    "items" | "defaultItems"
  >,
): CompositeSelectableStore<T>;

export function useCompositeSelectableStore(
  props?: CompositeSelectableStoreProps,
): CompositeSelectableStore;

export function useCompositeSelectableStore(
  props: CompositeSelectableStoreProps = {},
): CompositeSelectableStore {
  props = useCompositeSelectableStoreOptions(props);
  const [store, update] = useStore(Core.createCompositeSelectableStore, props);
  return useCompositeSelectableStoreProps(store, update, props);
}

export interface CompositeSelectableStoreItem
  extends Core.CompositeSelectableStoreItem {}

export interface CompositeSelectableStoreState<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
>
  extends Core.CompositeSelectableStoreState<T>, CompositeStoreState<T> {}

export interface CompositeSelectableStoreFunctions<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
>
  extends
    Core.CompositeSelectableStoreFunctions<T>,
    CompositeStoreFunctions<T> {}

export interface CompositeSelectableStoreOptions<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
>
  extends Core.CompositeSelectableStoreOptions<T>, CompositeStoreOptions<T> {
  /**
   * A callback that gets called when the `selectedIds` state changes.
   */
  setSelectedIds?: BivariantCallback<
    (selectedIds: CompositeSelectableStoreState<T>["selectedIds"]) => void
  >;
}

export interface CompositeSelectableStoreProps<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
>
  extends
    CompositeSelectableStoreOptions<T>,
    Core.CompositeSelectableStoreProps<T> {}

export interface CompositeSelectableStore<
  T extends CompositeSelectableStoreItem = CompositeSelectableStoreItem,
>
  extends
    CompositeSelectableStoreFunctions<T>,
    Store<Core.CompositeSelectableStore<T>> {}

export type SelectableRangeDelegate = Core.SelectableRangeDelegate;
