import * as Core from "@ariakit/core/dialog/dialog-store";
import {
  DisclosureStoreFunctions,
  DisclosureStoreOptions,
  DisclosureStoreState,
  useDisclosureStoreOptions,
  useDisclosureStoreProps,
} from "../disclosure/disclosure-store";
import { Store, useStore } from "../utils/store";

export function useDialogStoreOptions(props: DialogStoreProps) {
  return useDisclosureStoreOptions(props);
}

export function useDialogStoreProps<T extends DialogStore>(
  store: T,
  props: DialogStoreProps
) {
  return useDisclosureStoreProps(store, props);
}

export function useDialogStore(props: DialogStoreProps = {}): DialogStore {
  const options = useDialogStoreOptions(props);
  const store = useStore(() =>
    Core.createDialogStore({ ...props, ...options })
  );
  return useDialogStoreProps(store, props);
}

export type DialogStoreState = Core.DialogStoreState & DisclosureStoreState;

export type DialogStoreFunctions = Core.DialogStoreFunctions &
  DisclosureStoreFunctions;

export type DialogStoreOptions = Core.DialogStoreOptions &
  DisclosureStoreOptions;

export type DialogStoreProps = DialogStoreOptions & Core.DialogStoreProps;

export type DialogStore = DialogStoreFunctions & Store<Core.DialogStore>;
