import * as Core from "@ariakit/core/tooltip/tooltip-store";
import type {
  HovercardStoreFunctions,
  HovercardStoreOptions,
  HovercardStoreState,
} from "../hovercard/hovercard-store.js";
import {
  useHovercardStoreOptions,
  useHovercardStoreProps,
} from "../hovercard/hovercard-store.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useTooltipStoreOptions(props: TooltipStoreProps) {
  return useHovercardStoreOptions(props);
}

export function useTooltipStoreProps<T extends TooltipStore>(
  store: T,
  props: TooltipStoreProps,
) {
  store = useHovercardStoreProps(store, props);
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
  const options = useTooltipStoreOptions(props);
  const store = useStore(() =>
    Core.createTooltipStore({ ...props, ...options }),
  );
  return useTooltipStoreProps(store, props);
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

export type TooltipStoreProps = TooltipStoreOptions & Core.TooltipStoreProps;

export type TooltipStore = TooltipStoreFunctions & Store<Core.TooltipStore>;
