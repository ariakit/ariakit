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

/**
 * Creates a hovercard store.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const hovercard = useHovercardStore({ placement: "top" });
 * <HovercardAnchor store={hovercard}>@username</HovercardAnchor>
 * <Hovercard store={hovercard}>Details</Hovercard>
 * ```
 */
export function useHovercardStore(
  props: HovercardStoreProps = {}
): HovercardStore {
  const options = useHovercardStoreOptions(props);
  const store = useStore(() =>
    Core.createHovercardStore({ ...props, ...options })
  );
  return useHovercardStoreProps(store, props);
}

export interface HovercardStoreState
  extends Core.HovercardStoreState,
    PopoverStoreState {}

export interface HovercardStoreFunctions
  extends Core.HovercardStoreFunctions,
    PopoverStoreFunctions {}

export interface HovercardStoreOptions
  extends Core.HovercardStoreOptions,
    PopoverStoreOptions {}

export type HovercardStoreProps = HovercardStoreOptions &
  Core.HovercardStoreProps;

export type HovercardStore = HovercardStoreFunctions &
  Store<Core.HovercardStore>;
