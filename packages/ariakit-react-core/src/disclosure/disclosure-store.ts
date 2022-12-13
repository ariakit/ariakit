import * as Core from "@ariakit/core/disclosure/disclosure-store";
import { Store, useStore, useStoreProps } from "../utils/store";

export function useDisclosureStoreOptions(
  _props: DisclosureStoreProps
): Partial<DisclosureStoreOptions> {
  return {};
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
  const store = useStore(() =>
    Core.createDisclosureStore({ ...props, ...options })
  );
  return useDisclosureStoreProps(store, props);
}

export type DisclosureStoreState = Core.DisclosureStoreState;

export type DisclosureStoreFunctions = Core.DisclosureStoreFunctions;

export type DisclosureStoreOptions = Core.DisclosureStoreOptions & {
  setOpen?: (open: DisclosureStoreState["open"]) => void;
};

export type DisclosureStoreProps = DisclosureStoreOptions &
  Core.DisclosureStoreProps;

export type DisclosureStore = DisclosureStoreFunctions &
  Store<Core.DisclosureStore>;
