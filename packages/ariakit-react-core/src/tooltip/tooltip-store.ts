import * as Core from "@ariakit/core/tooltip/tooltip-store";
import type {
  HovercardStoreFunctions,
  HovercardStoreOptions,
  HovercardStoreState,
} from "../hovercard/hovercard-store.js";
import { useHovercardStoreProps } from "../hovercard/hovercard-store.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useTooltipStoreProps<T extends Core.TooltipStore>(
  store: T,
  update: () => void,
  props: TooltipStoreProps,
) {
  useStoreProps(store, props, "type");
  useStoreProps(store, props, "skipTimeout");
  return useHovercardStoreProps(store, update, props);
}

/**
 * Creates a tooltip store to control the state of
 * [Tooltip](https://ariakit.org/components/tooltip) components.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * const tooltip = useTooltipStore();
 *
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
  extends Omit<Core.TooltipStoreFunctions, "disclosure">,
    HovercardStoreFunctions {}

export interface TooltipStoreOptions
  extends Omit<Core.TooltipStoreOptions, "disclosure">,
    HovercardStoreOptions {}

export interface TooltipStoreProps
  extends TooltipStoreOptions,
    Omit<Core.TooltipStoreProps, "disclosure"> {}

export interface TooltipStore
  extends TooltipStoreFunctions,
    Omit<Store<Core.TooltipStore>, "disclosure"> {}
