import * as Core from "@ariakit/components/menubar/menubar-store";
import { useStore } from "@ariakit/react-store";
import type { Store } from "@ariakit/react-store";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.ts";
import { useCompositeStoreProps } from "../composite/composite-store.ts";

export function useMenubarStoreProps<T extends Core.MenubarStore>(
  store: T,
  update: () => void,
  props: MenubarStoreProps,
) {
  return useCompositeStoreProps(store, update, props);
}

/**
 * Creates a menubar store to control the state of
 * [Menubar](https://ariakit.com/components/menubar) components.
 * @see https://ariakit.com/components/menubar
 * @example
 * ```jsx
 * const menubar = useMenubarStore();
 *
 * <Menubar store={menubar} />
 * ```
 */
export function useMenubarStore(props: MenubarStoreProps = {}): MenubarStore {
  const [store, update] = useStore(Core.createMenubarStore, props);
  return useMenubarStoreProps(store, update, props);
}

export interface MenubarStoreState
  extends Core.MenubarStoreState, CompositeStoreState {}

export interface MenubarStoreFunctions
  extends Core.MenubarStoreFunctions, CompositeStoreFunctions {}

export interface MenubarStoreOptions
  extends Core.MenubarStoreOptions, CompositeStoreOptions {}

export interface MenubarStoreProps
  extends MenubarStoreOptions, Core.MenubarStoreProps {}

export interface MenubarStore
  extends MenubarStoreFunctions, Store<Core.MenubarStore> {}
