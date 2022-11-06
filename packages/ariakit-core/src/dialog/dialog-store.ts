import {
  DisclosureStore,
  DisclosureStoreProps,
  DisclosureStoreState,
  createDisclosureStore,
} from "../disclosure/disclosure-store";

export function createDialogStore(props: DialogStoreProps = {}): DialogStore {
  return createDisclosureStore(props);
}

export type DialogStoreState = DisclosureStoreState;

export type DialogStore = DisclosureStore;

export type DialogStoreProps = DisclosureStoreProps;
