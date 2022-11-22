import {
  DialogStore as CoreDialogStore,
  DialogStoreProps as CoreDialogStoreProps,
  DialogState,
  createDialogStore,
} from "@ariakit/core/dialog/dialog-store";
import { Store, useStore } from "@ariakit/react-core/utils/store";
import {
  DisclosureStoreProps,
  getDisclosureDefaultState,
  useDisclosureStoreProps,
} from "../disclosure/disclosure-store";

export function getDialogDefaultState(props: DialogStoreProps) {
  return getDisclosureDefaultState(props);
}

export function useDialogStoreProps<T extends DialogStore>(
  store: T,
  props: DialogStoreProps
) {
  return useDisclosureStoreProps(store, props);
}

export function useDialogStore(props: DialogStoreProps = {}): DialogStore {
  let store = useStore(() =>
    createDialogStore({ ...props, ...getDialogDefaultState(props) })
  );
  store = useDialogStoreProps(store, props);
  return store;
}

export type { DialogState };

export type DialogStore = Store<CoreDialogStore>;

export type DialogStoreProps = CoreDialogStoreProps & DisclosureStoreProps;
