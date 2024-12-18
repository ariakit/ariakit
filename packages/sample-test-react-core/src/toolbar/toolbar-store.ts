import * as Core from "@ariakit/core/toolbar/toolbar-store";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.ts";
import { useCompositeStoreProps } from "../composite/composite-store.ts";
import type { Store } from "../utils/store.tsx";
import { useStore } from "../utils/store.tsx";

export function useToolbarStoreProps<T extends Core.ToolbarStore>(
  store: T,
  update: () => void,
  props: ToolbarStoreProps,
) {
  return useCompositeStoreProps(store, update, props);
}

/**
 * Creates a toolbar store to control the state of
 * [Toolbar](https://ariakit.org/components/toolbar) components.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const toolbar = useToolbarStore();
 *
 * <Toolbar store={toolbar}>
 *   <ToolbarItem>Item 1</ToolbarItem>
 *   <ToolbarItem>Item 2</ToolbarItem>
 *   <ToolbarItem>Item 3</ToolbarItem>
 * </Toolbar>
 * ```
 */
export function useToolbarStore(props: ToolbarStoreProps = {}): ToolbarStore {
  const [store, update] = useStore(Core.createToolbarStore, props);
  return useToolbarStoreProps(store, update, props);
}

export interface ToolbarStoreState
  extends Core.ToolbarStoreState,
    CompositeStoreState {}

export interface ToolbarStoreFunctions
  extends Core.ToolbarStoreFunctions,
    CompositeStoreFunctions {}

export interface ToolbarStoreOptions
  extends Core.ToolbarStoreOptions,
    CompositeStoreOptions {}

export interface ToolbarStoreProps
  extends ToolbarStoreOptions,
    Core.ToolbarStoreProps {}

export interface ToolbarStore
  extends ToolbarStoreFunctions,
    Store<Core.ToolbarStore> {}
