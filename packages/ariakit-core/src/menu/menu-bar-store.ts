import { Store, createStore } from "ariakit-utils/store";
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
  const composite = createCompositeStore({ orientation, focusLoop, ...props });
  const store = createStore<MenuBarStoreState>(composite.getState(), composite);
  return { ...composite, ...store };
}

export type MenuBarStoreState = CompositeStoreState;

export type MenuBarStore = Omit<CompositeStore, keyof Store> &
  Store<MenuBarStoreState>;

export type MenuBarStoreProps = CompositeStoreProps;
