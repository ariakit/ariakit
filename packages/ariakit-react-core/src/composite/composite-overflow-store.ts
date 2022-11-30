import * as Core from "@ariakit/core/composite/composite-overflow-store";
import {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
  usePopoverStoreOptions,
  usePopoverStoreProps,
} from "../popover/popover-store";
import { Store, useStore } from "../utils/store";

export function useCompositeOverflowStoreOptions(
  props: CompositeOverflowStoreProps
) {
  return usePopoverStoreOptions(props);
}

export function useCompositeOverflowStoreProps<
  T extends CompositeOverflowStore
>(store: T, props: CompositeOverflowStoreProps) {
  return usePopoverStoreProps(store, props);
}

export function useCompositeOverflowStore(
  props: CompositeOverflowStoreProps = {}
): CompositeOverflowStore {
  const options = useCompositeOverflowStoreOptions(props);
  const store = useStore(() =>
    Core.createCompositeOverflowStore({ ...props, ...options })
  );
  return useCompositeOverflowStoreProps(store, props);
}

export type CompositeOverflowStoreState = Core.CompositeOverflowStoreState &
  PopoverStoreState;

export type CompositeOverflowStoreFunctions =
  Core.CompositeOverflowStoreFunctions & PopoverStoreFunctions;

export type CompositeOverflowStoreOptions = Core.CompositeOverflowStoreOptions &
  PopoverStoreOptions;

export type CompositeOverflowStoreProps = CompositeOverflowStoreOptions &
  Core.CompositeOverflowStoreProps;

export type CompositeOverflowStore = CompositeOverflowStoreFunctions &
  Store<Core.CompositeOverflowStore>;
