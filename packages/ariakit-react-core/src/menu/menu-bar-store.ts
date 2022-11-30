import * as Core from "@ariakit/core/menu/menu-bar-store";
import { Store, useStore } from "@ariakit/react-core/utils/store";
import {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store";

export function useMenuBarStoreOptions(props: MenuBarStoreProps) {
  return useCompositeStoreOptions(props);
}

export function useMenuBarStoreProps<T extends MenuBarStore>(
  store: T,
  props: MenuBarStoreProps
) {
  return useCompositeStoreProps(store, props);
}

export function useMenuBarStore(props: MenuBarStoreProps = {}): MenuBarStore {
  const options = useMenuBarStoreOptions(props);
  const store = useStore(() =>
    Core.createMenuBarStore({ ...props, ...options })
  );
  return useMenuBarStoreProps(store, props);
}

export type MenuBarStoreState = Core.MenuBarStoreState & CompositeStoreState;

export type MenuBarStoreFunctions = Core.MenuBarStoreFunctions &
  CompositeStoreFunctions;

export type MenuBarStoreOptions = Core.MenuBarStoreOptions &
  CompositeStoreOptions;

export type MenuBarStoreProps = MenuBarStoreOptions & Core.MenuBarStoreProps;

export type MenuBarStore = MenuBarStoreFunctions & Store<Core.MenuBarStore>;
