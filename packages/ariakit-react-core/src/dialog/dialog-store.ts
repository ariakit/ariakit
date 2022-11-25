import {
  DialogStore as CoreDialogStore,
  DialogStoreProps as CoreDialogStoreProps,
  DialogStoreState,
  createDialogStore,
} from "@ariakit/core/dialog/dialog-store";
import { Store, useStore } from "@ariakit/react-core/utils/store";
import {
  DisclosureStoreProps,
  useDisclosureStoreOptions,
  useDisclosureStoreProps,
} from "../disclosure/disclosure-store";

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
  let store = useStore(() => createDialogStore({ ...props, ...options }));
  store = useDialogStoreProps(store, props);
  return store;
}

export type { DialogStoreState };

export type DialogStore = Store<CoreDialogStore>;

export type DialogStoreProps = CoreDialogStoreProps & DisclosureStoreProps;
