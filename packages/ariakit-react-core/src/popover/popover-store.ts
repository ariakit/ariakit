import * as Core from "@ariakit/core/popover/popover-store";
import type {
  DialogStoreFunctions,
  DialogStoreOptions,
  DialogStoreState,
} from "../dialog/dialog-store.js";
import { useDialogStoreProps } from "../dialog/dialog-store.js";
import { useUpdateEffect } from "../utils/hooks.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function usePopoverStoreProps<T extends Core.PopoverStore>(
  store: T,
  update: () => void,
  props: PopoverStoreProps,
) {
  useUpdateEffect(update, [props.popover]);
  store = useDialogStoreProps(store, update, props);
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
  const [store, update] = useStore(Core.createPopoverStore, props);
  return usePopoverStoreProps(store, update, props);
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
