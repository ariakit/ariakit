import * as Core from "@ariakit/core/dialog/dialog-store";
import type {
  DisclosureStoreFunctions,
  DisclosureStoreOptions,
  DisclosureStoreState,
} from "../disclosure/disclosure-store.js";
import { useDisclosureStoreProps } from "../disclosure/disclosure-store.js";
import { useStore } from "../utils/store.js";
import type { Store } from "../utils/store.js";

export function useDialogStoreProps<T extends Core.DialogStore>(
  store: T,
  update: () => void,
  props: DialogStoreProps,
) {
  return useDisclosureStoreProps(store, update, props);
}

/**
 * Creates a dialog store to control the state of
 * [Dialog](https://ariakit.org/components/dialog) components.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const dialog = useDialogStore();
 *
 * <button onClick={dialog.toggle}>Open dialog</button>
 * <Dialog store={dialog}>Content</Dialog>
 * ```
 */
export function useDialogStore(props: DialogStoreProps = {}): DialogStore {
  const [store, update] = useStore(Core.createDialogStore, props);
  return useDialogStoreProps(store, update, props);
}

export interface DialogStoreState
  extends Core.DialogStoreState,
    DisclosureStoreState {}

export interface DialogStoreFunctions
  extends Omit<Core.DialogStoreFunctions, "disclosure">,
    DisclosureStoreFunctions {}

export interface DialogStoreOptions
  extends Omit<Core.DialogStoreOptions, "disclosure">,
    DisclosureStoreOptions {}

export interface DialogStoreProps
  extends DialogStoreOptions,
    Omit<Core.DialogStoreProps, "disclosure"> {}

export interface DialogStore
  extends DialogStoreFunctions,
    Omit<Store<Core.DialogStore>, "disclosure"> {}
