import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.ts";
import { createPopoverStore } from "../popover/popover-store.ts";
import type { Store, StoreProps } from "../utils/store.ts";

/**
 * Creates a compositeOverflow store.
 */
export function createCompositeOverflowStore(
  props: CompositeOverflowStoreProps = {},
): CompositeOverflowStore {
  return createPopoverStore(props);
}

export interface CompositeOverflowStoreState extends PopoverStoreState {}

export interface CompositeOverflowStoreFunctions
  extends PopoverStoreFunctions {}

export interface CompositeOverflowStoreOptions extends PopoverStoreOptions {}

export interface CompositeOverflowStoreProps
  extends CompositeOverflowStoreOptions,
    StoreProps<CompositeOverflowStoreState> {}

export interface CompositeOverflowStore
  extends CompositeOverflowStoreFunctions,
    Store<CompositeOverflowStoreState> {}
