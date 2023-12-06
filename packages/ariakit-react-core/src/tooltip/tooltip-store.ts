import * as Core from "@ariakit/core/tooltip/tooltip-store";
import type {
  HovercardStoreFunctions,
  HovercardStoreOptions,
  HovercardStoreState,
} from "../hovercard/hovercard-store.js";
import { useHovercardStoreProps } from "../hovercard/hovercard-store.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useTooltipStoreProps<T extends TooltipStore>(
  store: T,
  update: () => void,
  props: TooltipStoreProps,
) {
  store = useHovercardStoreProps(store, update, props);
  useStoreProps(store, props, "type");
  useStoreProps(store, props, "skipTimeout");
  return store;
}

/**
 * Creates a tooltip store.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const tooltip = useTooltipStore();
 * <TooltipAnchor store={tooltip}>Anchor</TooltipAnchor>
 * <Tooltip store={tooltip}>Tooltip</Tooltip>
 * ```
 */
export function useTooltipStore(props: TooltipStoreProps = {}): TooltipStore {
  const [store, update] = useStore(Core.createTooltipStore, props);
  return useTooltipStoreProps(store, update, props);
}

export interface TooltipStoreState
  extends Core.TooltipStoreState,
    HovercardStoreState {}

export interface TooltipStoreFunctions
  extends Core.TooltipStoreFunctions,
    HovercardStoreFunctions {}

export interface TooltipStoreOptions
  extends Core.TooltipStoreOptions,
    HovercardStoreOptions {}

export interface TooltipStoreProps
  extends TooltipStoreOptions,
    Core.TooltipStoreProps {}

export interface TooltipStore
  extends TooltipStoreFunctions,
    Store<Core.TooltipStore> {}
