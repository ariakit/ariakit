export interface MenuStoreSetup {
  autoFocusOnMount: boolean;
  hasCommitted: boolean;
}

const menuStoreSetups = new WeakMap<object, MenuStoreSetup>();

export function setMenuStoreSetup(store: object, setup: MenuStoreSetup) {
  menuStoreSetups.set(store, setup);
}

export function getMenuStoreSetup(store?: object | null) {
  if (!store) return;
  return menuStoreSetups.get(store);
}
