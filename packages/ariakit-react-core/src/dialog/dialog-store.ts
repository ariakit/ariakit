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
 * Creates a dialog store.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * const dialog = useDialogStore();
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
  extends Core.DialogStoreFunctions,
    DisclosureStoreFunctions {}

export interface DialogStoreOptions
  extends Core.DialogStoreOptions,
    DisclosureStoreOptions {}

export type DialogStoreProps = DialogStoreOptions & Core.DialogStoreProps;

export type DialogStore = DialogStoreFunctions & Store<Core.DialogStore>;
