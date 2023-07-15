import type {
  PopoverStore,
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreProps,
  PopoverStoreState,
} from "../popover/popover-store.js";
import { createPopoverStore } from "../popover/popover-store.js";

/**
 * Creates a composite overflow store.
 */
export function createCompositeOverflowStore(
  props: CompositeOverflowStoreProps = {},
): CompositeOverflowStore {
  return createPopoverStore(props);
}

export type CompositeOverflowStoreState = PopoverStoreState;

export type CompositeOverflowStoreFunctions = PopoverStoreFunctions;

export type CompositeOverflowStoreOptions = PopoverStoreOptions;

export type CompositeOverflowStoreProps = PopoverStoreProps;

export type CompositeOverflowStore = PopoverStore;
