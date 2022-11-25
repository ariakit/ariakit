import {
  DisclosureStore as CoreDisclosureStore,
  DisclosureStoreProps as CoreDisclosureStoreProps,
  DisclosureStoreState,
  createDisclosureStore,
} from "@ariakit/core/disclosure/disclosure-store";
import {
  Store,
  useStore,
  useStoreProps,
} from "@ariakit/react-core/utils/store";

export function useDisclosureStoreOptions(props: DisclosureStoreProps) {
  return {
    open: props.open ?? props.getState?.().open ?? props.defaultOpen,
    animated: props.animated ?? props.getState?.().animated,
  };
}

export function useDisclosureStoreProps<T extends DisclosureStore>(
  store: T,
  props: DisclosureStoreProps
) {
  useStoreProps(store, props, "open", "setOpen");
  useStoreProps(store, props, "animated");
  return store;
}

export function useDisclosureStore(
  props: DisclosureStoreProps = {}
): DisclosureStore {
  const options = useDisclosureStoreOptions(props);
  let store = useStore(() => createDisclosureStore({ ...props, ...options }));
  store = useDisclosureStoreProps(store, props);
  return store;
}

export type { DisclosureStoreState };

export type DisclosureStore = Store<CoreDisclosureStore>;

export type DisclosureStoreProps = CoreDisclosureStoreProps & {
  defaultOpen?: DisclosureStoreState["open"];
  setOpen?: (open: DisclosureStoreState["open"]) => void;
};
