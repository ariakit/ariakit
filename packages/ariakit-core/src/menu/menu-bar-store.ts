import { createMenubarStore } from "../menubar/menubar-store.js";
import type {
  MenubarStore,
  MenubarStoreFunctions,
  MenubarStoreOptions,
  MenubarStoreProps,
  MenubarStoreState,
} from "../menubar/menubar-store.js";

/**
 * Creates a menu bar store.
 */
export function createMenuBarStore(
  props: MenuBarStoreProps = {},
): MenuBarStore {
  return createMenubarStore(props);
}

export type MenuBarStoreState = MenubarStoreState;

export type MenuBarStoreFunctions = MenubarStoreFunctions;

export type MenuBarStoreOptions = MenubarStoreOptions;

export type MenuBarStoreProps = MenubarStoreProps;

export type MenuBarStore = MenubarStore;
