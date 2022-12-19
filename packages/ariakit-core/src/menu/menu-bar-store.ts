import {
  CompositeStore,
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreProps,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import { defaultValue } from "../utils/misc";

/**
 * Creates a menu bar store.
 */
export function createMenuBarStore(
  props: MenuBarStoreProps = {}
): MenuBarStore {
  const syncState = props.store?.getState();

  return createCompositeStore({
    ...props,
    orientation: defaultValue(
      props.orientation,
      syncState?.orientation,
      "horizontal" as const
    ),
    focusLoop: defaultValue(props.focusLoop, syncState?.focusLoop, true),
  });
}

export type MenuBarStoreState = CompositeStoreState;

export type MenuBarStoreFunctions = CompositeStoreFunctions;

export type MenuBarStoreOptions = CompositeStoreOptions;

export type MenuBarStoreProps = CompositeStoreProps;

export type MenuBarStore = CompositeStore;
