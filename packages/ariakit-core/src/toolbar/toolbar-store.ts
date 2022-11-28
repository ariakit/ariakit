import {
  CompositeStore,
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

export type ToolbarStore = CompositeStore;

export type ToolbarStoreProps = CompositeStoreProps;
