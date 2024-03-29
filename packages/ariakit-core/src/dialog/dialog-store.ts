import type {
  DisclosureStoreFunctions,
  DisclosureStoreOptions,
  DisclosureStoreState,
} from "../disclosure/disclosure-store.ts";
import { createDisclosureStore } from "../disclosure/disclosure-store.ts";
import type { Store, StoreProps } from "../utils/store.ts";

/**
 * Creates a dialog store.
 */
export function createDialogStore(props: DialogStoreProps = {}): DialogStore {
  return createDisclosureStore(props);
}

export interface DialogStoreState extends DisclosureStoreState {}

export interface DialogStoreFunctions extends DisclosureStoreFunctions {}

export interface DialogStoreOptions extends DisclosureStoreOptions {}

export interface DialogStoreProps
  extends DialogStoreOptions,
    StoreProps<DialogStoreState> {}

export interface DialogStore
  extends DialogStoreFunctions,
    Store<DialogStoreState> {}
