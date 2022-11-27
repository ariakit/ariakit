import {
  MenuBarStore as CoreMenuBarStore,
  MenuBarStoreProps as CoreMenuBarStoreProps,
  MenuBarStoreState,
  createMenuBarStore,
} from "@ariakit/core/menu/menu-bar-store";
import { Store, useStore } from "@ariakit/react-core/utils/store";
import {
  CompositeStoreProps,
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
  let store = useStore(() => createMenuBarStore({ ...props, ...options }));
  store = useMenuBarStoreProps(store, props);
  return store;
}

export type { MenuBarStoreState };

export type MenuBarStore = Store<CoreMenuBarStore>;

export type MenuBarStoreProps = CoreMenuBarStoreProps & CompositeStoreProps;
