import {
  CompositeStore,
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

export type MenuBarStore = CompositeStore;

export type MenuBarStoreProps = CompositeStoreProps;
