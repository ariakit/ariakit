import * as Core from "@ariakit/core/popover/popover-store";
import type {
  DialogStoreFunctions,
  DialogStoreOptions,
  DialogStoreState,
} from "../dialog/dialog-store.js";
import {
  useDialogStoreOptions,
  useDialogStoreProps,
} from "../dialog/dialog-store.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function usePopoverStoreOptions(props: PopoverStoreProps) {
  return useDialogStoreOptions(props);
}

export function usePopoverStoreProps<T extends PopoverStore>(
  store: T,
  props: PopoverStoreProps
) {
  store = useDialogStoreProps(store, props);
  useStoreProps(store, props, "placement");
  return store;
}

/**
 * Creates a popover store.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const popover = usePopoverStore();
 * <PopoverDisclosure store={popover}>Disclosure</PopoverDisclosure>
 * <Popover store={popover}>Popover</Popover>
 * ```
 */
export function usePopoverStore(props: PopoverStoreProps = {}): PopoverStore {
  const options = usePopoverStoreOptions(props);
  const store = useStore(() =>
    Core.createPopoverStore({ ...props, ...options })
  );
  return usePopoverStoreProps(store, props);
}

export interface PopoverStoreState
  extends Core.PopoverStoreState,
    DialogStoreState {}

export interface PopoverStoreFunctions
  extends Core.PopoverStoreFunctions,
    DialogStoreFunctions {}

export interface PopoverStoreOptions
  extends Core.PopoverStoreOptions,
    DialogStoreOptions {}

export type PopoverStoreProps = PopoverStoreOptions & Core.PopoverStoreProps;

export type PopoverStore = PopoverStoreFunctions & Store<Core.PopoverStore>;
