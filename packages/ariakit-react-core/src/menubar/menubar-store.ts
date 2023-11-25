import * as Core from "@ariakit/core/menubar/menubar-store";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { useCompositeStoreProps } from "../composite/composite-store.js";
import type { Store } from "../utils/store.js";
import { useStore } from "../utils/store.js";

export function useMenubarStoreProps<T extends Core.MenubarStore>(
  store: T,
  update: () => void,
  props: MenubarStoreProps,
) {
  return useCompositeStoreProps(store, update, props);
}

/**
 * Creates a menubar store.
 * @see https://ariakit.org/components/menubar
 * @example
 * ```jsx
 * const menu = useMenubarStore();
 * <Menubar store={menu} />
 * ```
 */
export function useMenubarStore(props: MenubarStoreProps = {}): MenubarStore {
  const [store, update] = useStore(Core.createMenubarStore, props);
  return useMenubarStoreProps(store, update, props);
}

export interface MenubarStoreState
  extends Core.MenubarStoreState,
    CompositeStoreState {}

export interface MenubarStoreFunctions
  extends Core.MenubarStoreFunctions,
    CompositeStoreFunctions {}

export interface MenubarStoreOptions
  extends Core.MenubarStoreOptions,
    CompositeStoreOptions {}

export type MenubarStoreProps = MenubarStoreOptions & Core.MenubarStoreProps;

export type MenubarStore = MenubarStoreFunctions & Store<Core.MenubarStore>;
