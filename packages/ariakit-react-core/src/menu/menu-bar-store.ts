import * as Core from "@ariakit/core/menu/menu-bar-store";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import {
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store.js";
import type { Store } from "../utils/store.js";
import { useStore } from "../utils/store.js";

export function useMenuBarStoreOptions(props: MenuBarStoreProps) {
  return useCompositeStoreOptions(props);
}

export function useMenuBarStoreProps<T extends MenuBarStore>(
  store: T,
  props: MenuBarStoreProps
) {
  return useCompositeStoreProps(store, props);
}

/**
 * Creates a menu bar store.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const menu = useMenuBarStore();
 * <MenuBar store={menu} />
 * ```
 */
export function useMenuBarStore(props: MenuBarStoreProps = {}): MenuBarStore {
  const options = useMenuBarStoreOptions(props);
  const store = useStore(() =>
    Core.createMenuBarStore({ ...props, ...options })
  );
  return useMenuBarStoreProps(store, props);
}

export interface MenuBarStoreState
  extends Core.MenuBarStoreState,
    CompositeStoreState {}

export interface MenuBarStoreFunctions
  extends Core.MenuBarStoreFunctions,
    CompositeStoreFunctions {}

export interface MenuBarStoreOptions
  extends Core.MenuBarStoreOptions,
    CompositeStoreOptions {}

export type MenuBarStoreProps = MenuBarStoreOptions & Core.MenuBarStoreProps;

export type MenuBarStore = MenuBarStoreFunctions & Store<Core.MenuBarStore>;
