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
  useStoreProps(store, props, "timeout");
  useStoreProps(store, props, "showTimeout");
  useStoreProps(store, props, "hideTimeout");
  return usePopoverStoreProps(store, update, props);
}

/**
 * Creates a hovercard store to control the state of
 * [Hovercard](https://ariakit.org/reference/hovercard) components.
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
  extends Omit<Core.HovercardStoreFunctions, "disclosure">,
    PopoverStoreFunctions {}

export interface HovercardStoreOptions
  extends Omit<Core.HovercardStoreOptions, "disclosure">,
    PopoverStoreOptions {}

export interface HovercardStoreProps
  extends HovercardStoreOptions,
    Omit<Core.HovercardStoreProps, "disclosure"> {}

export interface HovercardStore
  extends HovercardStoreFunctions,
    Omit<Store<Core.HovercardStore>, "disclosure"> {}
