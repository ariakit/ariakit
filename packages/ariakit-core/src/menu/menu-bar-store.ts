import {
  CompositeStore,
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreProps,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";

export function createMenuBarStore({
  orientation = "horizontal",
  focusLoop = true,
  ...props
}: MenuBarStoreProps = {}): MenuBarStore {
  return createCompositeStore({ orientation, focusLoop, ...props });
}

export type MenuBarStoreState = CompositeStoreState;

export type MenuBarStoreFunctions = CompositeStoreFunctions;

export type MenuBarStoreOptions = CompositeStoreOptions;

export type MenuBarStoreProps = CompositeStoreProps;

export type MenuBarStore = CompositeStore;
