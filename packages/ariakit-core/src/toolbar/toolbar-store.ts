import {
  CompositeStore,
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreProps,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";

export function createToolbarStore({
  orientation = "horizontal",
  focusLoop = true,
  ...props
}: ToolbarStoreProps = {}): ToolbarStore {
  return createCompositeStore({ orientation, focusLoop, ...props });
}

export type ToolbarStoreState = CompositeStoreState;

export type ToolbarStoreFunctions = CompositeStoreFunctions;

export type ToolbarStoreOptions = CompositeStoreOptions;

export type ToolbarStore = CompositeStore;

export type ToolbarStoreProps = CompositeStoreProps;
