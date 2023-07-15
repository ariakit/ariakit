import * as Core from "@ariakit/core/composite/composite-overflow-store";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.js";
import {
  usePopoverStoreOptions,
  usePopoverStoreProps,
} from "../popover/popover-store.js";
import type { Store } from "../utils/store.js";
import { useStore } from "../utils/store.js";

export function useCompositeOverflowStoreOptions(
  props: CompositeOverflowStoreProps,
) {
  return usePopoverStoreOptions(props);
}

export function useCompositeOverflowStoreProps<
  T extends CompositeOverflowStore,
>(store: T, props: CompositeOverflowStoreProps) {
  return usePopoverStoreProps(store, props);
}

/**
 * Creates a composite overflow store.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 * const overflow = useCompositeOverflowStore();
 * <Composite store={composite}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 *   <CompositeOverflowDisclosure store={overflow}>
 *     +2 items
 *   </CompositeOverflowDisclosure>
 *   <CompositeOverflow store={overflow}>
 *     <CompositeItem>Item 3</CompositeItem>
 *     <CompositeItem>Item 4</CompositeItem>
 *   </CompositeOverflow>
 * </Composite>
 * ```
 */
export function useCompositeOverflowStore(
  props: CompositeOverflowStoreProps = {},
): CompositeOverflowStore {
  const options = useCompositeOverflowStoreOptions(props);
  const store = useStore(() =>
    Core.createCompositeOverflowStore({ ...props, ...options }),
  );
  return useCompositeOverflowStoreProps(store, props);
}

export interface CompositeOverflowStoreState
  extends Core.CompositeOverflowStoreState,
    PopoverStoreState {}

export interface CompositeOverflowStoreFunctions
  extends Core.CompositeOverflowStoreFunctions,
    PopoverStoreFunctions {}

export interface CompositeOverflowStoreOptions
  extends Core.CompositeOverflowStoreOptions,
    PopoverStoreOptions {}

export type CompositeOverflowStoreProps = CompositeOverflowStoreOptions &
  Core.CompositeOverflowStoreProps;

export type CompositeOverflowStore = CompositeOverflowStoreFunctions &
  Store<Core.CompositeOverflowStore>;
