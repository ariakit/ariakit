import type { Store, StoreProps } from "@ariakit/store";
import { defaultValue } from "@ariakit/utils";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.ts";
import { createCompositeStore } from "../composite/composite-store.ts";

/**
 * Creates a menubar store.
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

export interface MenubarStoreState extends CompositeStoreState {}

export interface MenubarStoreFunctions extends CompositeStoreFunctions {}

export interface MenubarStoreOptions extends CompositeStoreOptions {}

export interface MenubarStoreProps
  extends MenubarStoreOptions, StoreProps<MenubarStoreState> {}

export interface MenubarStore
  extends MenubarStoreFunctions, Store<MenubarStoreState> {}
