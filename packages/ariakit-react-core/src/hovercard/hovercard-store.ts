import * as Core from "@ariakit/core/hovercard/hovercard-store";
import {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
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
  const store = useStore(() =>
    Core.createHovercardStore({ ...props, ...options })
  );
  return useHovercardStoreProps(store, props);
}

export type HovercardStoreState = Core.HovercardStoreState & PopoverStoreState;

export type HovercardStoreFunctions = Core.HovercardStoreFunctions &
  PopoverStoreFunctions;

export type HovercardStoreOptions = Core.HovercardStoreOptions &
  PopoverStoreOptions;

export type HovercardStoreProps = HovercardStoreOptions &
  Core.HovercardStoreProps;

export type HovercardStore = HovercardStoreFunctions &
  Store<Core.HovercardStore>;
