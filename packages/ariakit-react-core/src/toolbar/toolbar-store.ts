import {
  ToolbarStore as CoreToolbarStore,
  ToolbarStoreProps as CoreToolbarStoreProps,
  ToolbarStoreState,
  createToolbarStore,
} from "@ariakit/core/toolbar/toolbar-store";
import { Store, useStore } from "@ariakit/react-core/utils/store";
import {
  CompositeStoreProps,
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store";

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
  const store = useStore(() => createToolbarStore({ ...props, ...options }));
  return useToolbarStoreProps(store, props);
}

export type { ToolbarStoreState };

export type ToolbarStore = Store<CoreToolbarStore>;

export type ToolbarStoreProps = CoreToolbarStoreProps & CompositeStoreProps;
