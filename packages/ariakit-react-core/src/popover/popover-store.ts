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
  useStoreProps(store, props, "placement");
  return useDialogStoreProps(store, update, props);
}

/**
 * Creates a popover store to control the state of
 * [Popover](https://ariakit.org/components/popover) components.
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
  extends Omit<Core.PopoverStoreFunctions, "disclosure">,
    DialogStoreFunctions {}

export interface PopoverStoreOptions
  extends Omit<Core.PopoverStoreOptions, "disclosure">,
    DialogStoreOptions {}

export interface PopoverStoreProps
  extends PopoverStoreOptions,
    Omit<Core.PopoverStoreProps, "disclosure"> {}

export interface PopoverStore
  extends PopoverStoreFunctions,
    Omit<Store<Core.PopoverStore>, "disclosure"> {}
