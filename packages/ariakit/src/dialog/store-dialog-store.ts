import {
  DialogStore as CoreDialogStore,
  DialogStoreProps as CoreDialogStoreProps,
  DialogStoreState,
  createDialogStore,
} from "ariakit-core/dialog/dialog-store";
import {
  ParentStore,
  Store,
  useStore,
  useStoreSync,
} from "ariakit-react-utils/store2";
import { SetState } from "ariakit-utils/types";

export function useDialogStore(props: DialogStoreProps = {}): DialogStore {
  const store = useStore(() =>
    createDialogStore({
      open: props.open ?? props.getState?.().open ?? props.defaultOpen,
      animated: props.animated ?? props.getState?.().animated,
    })
  );

  useStoreSync(store, props, "open", "setOpen");
  useStoreSync(store, props, "animated");
  useStoreSync(store, props, "animating");
  useStoreSync(store, props, "contentElement");
  useStoreSync(store, props, "disclosureElement");

  return store;
}

export type { DialogStoreState };

export type DialogStoreProps = CoreDialogStoreProps &
  ParentStore<DialogStoreState> & {
    defaultOpen?: DialogStoreState["open"];
    setOpen?: SetState<DialogStoreState["open"]>;
  };

export type DialogStore = Store<CoreDialogStore>;
