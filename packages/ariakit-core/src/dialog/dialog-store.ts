import {
  DisclosureStore,
  DisclosureStoreFunctions,
  DisclosureStoreOptions,
  DisclosureStoreProps,
  DisclosureStoreState,
  createDisclosureStore,
} from "../disclosure/disclosure-store.js";

/**
 * Creates a dialog store.
 */
export function createDialogStore(props: DialogStoreProps = {}): DialogStore {
  return createDisclosureStore(props);
}

export type DialogStoreState = DisclosureStoreState;

export type DialogStoreFunctions = DisclosureStoreFunctions;

export type DialogStoreOptions = DisclosureStoreOptions;

export type DialogStoreProps = DisclosureStoreProps;

export type DialogStore = DisclosureStore;
