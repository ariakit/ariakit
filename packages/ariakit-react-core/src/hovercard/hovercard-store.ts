import * as Core from "@ariakit/core/hovercard/hovercard-store";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.js";
import {
  usePopoverStoreOptions,
  usePopoverStoreProps,
} from "../popover/popover-store.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useHovercardStoreOptions(props: HovercardStoreProps) {
  return usePopoverStoreOptions(props);
}

export function useHovercardStoreProps<T extends HovercardStore>(
  store: T,
  props: HovercardStoreProps,
) {
  store = usePopoverStoreProps(store, props);
  useStoreProps(store, props, "timeout");
  useStoreProps(store, props, "showTimeout");
  useStoreProps(store, props, "hideTimeout");
  return store;
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
  props: HovercardStoreProps = {},
): HovercardStore {
  const options = useHovercardStoreOptions(props);
  const store = useStore(() =>
    Core.createHovercardStore({ ...props, ...options }),
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
