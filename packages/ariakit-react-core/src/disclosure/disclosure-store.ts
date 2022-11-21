import {
  DisclosureStore as CoreDisclosureStore,
  DisclosureStoreProps as CoreDisclosureStoreProps,
  DisclosureState,
  createDisclosureStore,
} from "@ariakit/core/disclosure/disclosure-store";
import {
  Store,
  useStore,
  useStoreProps,
} from "@ariakit/react-core/utils/store";

export function getDisclosureDefaultState(props: DisclosureStoreProps) {
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
  let store = useStore(() =>
    createDisclosureStore({ ...props, ...getDisclosureDefaultState(props) })
  );
  store = useDisclosureStoreProps(store, props);
  return store;
}

export type { DisclosureState };

export type DisclosureStore = Store<CoreDisclosureStore>;

export type DisclosureStoreProps = CoreDisclosureStoreProps & {
  defaultOpen?: DisclosureState["open"];
  setOpen?: (open: DisclosureState["open"]) => void;
};
