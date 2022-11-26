import {
  HovercardStore as CoreHovercardStore,
  HovercardStoreProps as CoreHovercardStoreProps,
  HovercardStoreState,
  createHovercardStore,
} from "@ariakit/core/hovercard/hovercard-store";
import {
  PopoverStoreProps,
  usePopoverStoreOptions,
  usePopoverStoreProps,
} from "../popover/popover-store";
import { Store, useStore } from "../utils/store";

export function useHovercardStoreOptions(props: HovercardStoreProps) {
  return usePopoverStoreOptions(props);
}

export function useHovercardStoreProps<T extends HovercardStore>(
  store: T,
  props: HovercardStoreProps
) {
  return usePopoverStoreProps(store, props);
}

export function useHovercardStore(
  props: HovercardStoreProps = {}
): HovercardStore {
  const options = useHovercardStoreOptions(props);
  let store = useStore(() => createHovercardStore({ ...props, ...options }));
  store = useHovercardStoreProps(store, props);
  return store;
}

export type { HovercardStoreState };

export type HovercardStore = Store<CoreHovercardStore>;

export type HovercardStoreProps = CoreHovercardStoreProps & PopoverStoreProps;
