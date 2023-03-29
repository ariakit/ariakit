import * as Core from "@ariakit/core/tooltip/tooltip-store";
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
import { useStore } from "../utils/store.js";

export function useTooltipStoreOptions(props: TooltipStoreProps) {
  return usePopoverStoreOptions(props);
}

export function useTooltipStoreProps<T extends TooltipStore>(
  store: T,
  props: TooltipStoreProps
) {
  return usePopoverStoreProps(store, props);
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
  const options = useTooltipStoreOptions(props);
  const store = useStore(() =>
    Core.createTooltipStore({ ...props, ...options })
  );
  return useTooltipStoreProps(store, props);
}

export interface TooltipStoreState
  extends Core.TooltipStoreState,
    PopoverStoreState {}

export interface TooltipStoreFunctions
  extends Core.TooltipStoreFunctions,
    PopoverStoreFunctions {}

export interface TooltipStoreOptions
  extends Core.TooltipStoreOptions,
    PopoverStoreOptions {}

export type TooltipStoreProps = TooltipStoreOptions & Core.TooltipStoreProps;

export type TooltipStore = TooltipStoreFunctions & Store<Core.TooltipStore>;
