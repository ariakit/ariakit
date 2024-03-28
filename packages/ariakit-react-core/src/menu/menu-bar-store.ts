import { useEffect } from "react";
import type * as Core from "@ariakit/core/menu/menu-bar-store";
import {
  useMenubarStore,
  useMenubarStoreProps,
} from "../menubar/menubar-store.ts";
import type {
  MenubarStore,
  MenubarStoreFunctions,
  MenubarStoreOptions,
  MenubarStoreProps,
  MenubarStoreState,
} from "../menubar/menubar-store.ts";

export function useMenuBarStoreProps<T extends Core.MenuBarStore>(
  store: T,
  update: () => void,
  props: MenuBarStoreProps,
) {
  return useMenubarStoreProps(store, update, props);
}

/**
 * Creates a menu bar store.
 * @deprecated
 * Use [`useMenubarStore`](https://ariakit.org/reference/use-menubar-store)
 * instead.
 * @example
 * ```jsx
 * const menu = useMenuBarStore();
 * <MenuBar store={menu} />
 * ```
 */
export function useMenuBarStore(props: MenuBarStoreProps = {}): MenuBarStore {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "useMenuBarStore is deprecated. Use useMenubarStore instead.",
        "See https://ariakit.org/reference/use-menubar-store",
      );
    }
  }, []);
  return useMenubarStore(props);
}

export interface MenuBarStoreState extends MenubarStoreState {}

export interface MenuBarStoreFunctions extends MenubarStoreFunctions {}

export interface MenuBarStoreOptions extends MenubarStoreOptions {}

export interface MenuBarStoreProps extends MenubarStoreProps {}

export interface MenuBarStore extends MenubarStore {}
