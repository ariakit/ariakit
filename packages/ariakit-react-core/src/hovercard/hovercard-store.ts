import * as Core from "@ariakit/core/hovercard/hovercard-store";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.js";
import { usePopoverStoreProps } from "../popover/popover-store.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useHovercardStoreProps<T extends Core.HovercardStore>(
  store: T,
  update: () => void,
  props: HovercardStoreProps,
) {
  store = usePopoverStoreProps(store, update, props);
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
 *
 * <HovercardAnchor store={hovercard}>@username</HovercardAnchor>
 * <Hovercard store={hovercard}>Details</Hovercard>
 * ```
 */
export function useHovercardStore(
  props: HovercardStoreProps = {},
): HovercardStore {
  const [store, update] = useStore(Core.createHovercardStore, props);
  return useHovercardStoreProps(store, update, props);
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

export interface HovercardStoreProps
  extends HovercardStoreOptions,
    Core.HovercardStoreProps {}

export interface HovercardStore
  extends HovercardStoreFunctions,
    Store<Core.HovercardStore> {}
