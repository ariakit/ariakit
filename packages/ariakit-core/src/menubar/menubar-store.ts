import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { createCompositeStore } from "../composite/composite-store.js";
import { defaultValue } from "../utils/misc.js";
import { createStore } from "../utils/store.js";
import type { Store, StoreProps } from "../utils/store.js";

/**
 * Creates a menu bar store.
 */
export function createMenubarStore(
  props: MenubarStoreProps = {},
): MenubarStore {
  const syncState = props.store?.getState();

  const composite = createCompositeStore({
    ...props,
    orientation: defaultValue(
      props.orientation,
      syncState?.orientation,
      "horizontal" as const,
    ),
    focusLoop: defaultValue(props.focusLoop, syncState?.focusLoop, true),
  });

  const initialState: MenubarStoreState = {
    ...composite.getState(),
  };

  const menubar = createStore(initialState, composite, props.store);

  return {
    ...composite,
    ...menubar,
  };
}

export interface MenubarStoreState extends CompositeStoreState {}

export interface MenubarStoreFunctions extends CompositeStoreFunctions {}

export interface MenubarStoreOptions extends CompositeStoreOptions {}

export interface MenubarStoreProps
  extends MenubarStoreOptions,
    StoreProps<MenubarStoreState> {}

export interface MenubarStore
  extends MenubarStoreFunctions,
    Store<MenubarStoreState> {}
