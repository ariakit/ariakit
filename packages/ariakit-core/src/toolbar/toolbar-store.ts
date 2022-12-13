import {
  CompositeStore,
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreProps,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import { defaultValue } from "../utils/misc";

export function createToolbarStore(
  props: ToolbarStoreProps = {}
): ToolbarStore {
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

export type ToolbarStoreState = CompositeStoreState;

export type ToolbarStoreFunctions = CompositeStoreFunctions;

export type ToolbarStoreOptions = CompositeStoreOptions;

export type ToolbarStore = CompositeStore;

export type ToolbarStoreProps = CompositeStoreProps;
