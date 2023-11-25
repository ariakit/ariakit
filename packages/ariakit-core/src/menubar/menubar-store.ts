import type {
  CompositeStore,
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreProps,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { createCompositeStore } from "../composite/composite-store.js";
import { defaultValue } from "../utils/misc.js";

/**
 * Creates a menu bar store.
 */
export function createMenubarStore(
  props: MenubarStoreProps = {},
): MenubarStore {
  const syncState = props.store?.getState();

  return createCompositeStore({
    ...props,
    orientation: defaultValue(
      props.orientation,
      syncState?.orientation,
      "horizontal" as const,
    ),
    focusLoop: defaultValue(props.focusLoop, syncState?.focusLoop, true),
  });
}

export type MenubarStoreState = CompositeStoreState;

export type MenubarStoreFunctions = CompositeStoreFunctions;

export type MenubarStoreOptions = CompositeStoreOptions;

export type MenubarStoreProps = CompositeStoreProps;

export type MenubarStore = CompositeStore;
