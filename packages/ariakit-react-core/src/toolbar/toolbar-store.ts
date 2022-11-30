import * as Core from "@ariakit/core/toolbar/toolbar-store";
import {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store";
import { Store, useStore } from "../utils/store";

export function useToolbarStoreOptions(props: ToolbarStoreProps) {
  return useCompositeStoreOptions(props);
}

export function useToolbarStoreProps<T extends ToolbarStore>(
  store: T,
  props: ToolbarStoreProps
) {
  return useCompositeStoreProps(store, props);
}

export function useToolbarStore(props: ToolbarStoreProps = {}): ToolbarStore {
  const options = useToolbarStoreOptions(props);
  const store = useStore(() =>
    Core.createToolbarStore({ ...props, ...options })
  );
  return useToolbarStoreProps(store, props);
}

export type ToolbarStoreState = Core.ToolbarStoreState & CompositeStoreState;

export type ToolbarStoreFunctions = Core.ToolbarStoreFunctions &
  CompositeStoreFunctions;

export type ToolbarStoreOptions = Core.ToolbarStoreOptions &
  CompositeStoreOptions;

export type ToolbarStoreProps = ToolbarStoreOptions & Core.ToolbarStoreProps;

export type ToolbarStore = ToolbarStoreFunctions & Store<Core.ToolbarStore>;
