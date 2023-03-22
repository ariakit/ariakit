import * as Core from "@ariakit/core/dialog/dialog-store";
import {
  DisclosureStoreFunctions,
  DisclosureStoreOptions,
  DisclosureStoreState,
  useDisclosureStoreOptions,
  useDisclosureStoreProps,
} from "../disclosure/disclosure-store.js";
import { Store, useStore } from "../utils/store.jsx";

export function useDialogStoreOptions(props: DialogStoreProps) {
  return useDisclosureStoreOptions(props);
}

export function useDialogStoreProps<T extends DialogStore>(
  store: T,
  props: DialogStoreProps
) {
  return useDisclosureStoreProps(store, props);
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
  const options = useDialogStoreOptions(props);
  const store = useStore(() =>
    Core.createDialogStore({ ...props, ...options })
  );
  return useDialogStoreProps(store, props);
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
