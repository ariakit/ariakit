import { useMemo } from "react";
import * as Core from "@ariakit/core/tab/tab-store";
import {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store";
import { Store, useStore, useStoreProps } from "../utils/store";

type Item = Core.TabStoreItem;

export function useTabStoreOptions(props: TabStoreProps) {
  return useCompositeStoreOptions(props);
}

export function useTabStoreProps<T extends Store<Core.TabStore>>(
  store: T,
  props: TabStoreProps
) {
  store = useCompositeStoreProps(store, props);
  useStoreProps(store, props, "selectedId", "setSelectedId");
  useStoreProps(store, props, "selectOnMove");
  const panels = useStore(() => store.panels);
  return useMemo(() => ({ ...store, panels }), []);
}

export function useTabStore(props: TabStoreProps = {}): TabStore {
  const options = useTabStoreOptions(props);
  const store = useStore(() => Core.createTabStore({ ...props, ...options }));
  return useTabStoreProps(store, props);
}

export type TabStoreItem = Item;

export type TabStoreState = Core.TabStoreState & CompositeStoreState<Item>;

export type TabStoreFunctions = Core.TabStoreFunctions &
  CompositeStoreFunctions<Item> & {
    panels: Store<Core.TabStoreFunctions["panels"]>;
  };

export type TabStoreOptions = Core.TabStoreOptions &
  CompositeStoreOptions<Item> & {
    /**
     * Function that will be called when setting the tab `selectedId` state.
     * @example
     * function Tabs({ visibleTab, onTabChange }) {
     *   const tab = useTabStore({
     *     selectedId: visibleTab,
     *     setSelectedId: onTabChange,
     *   });
     * }
     */
    setSelectedId?: (selectedId: TabStoreState["selectedId"]) => void;
  };

export type TabStoreProps = TabStoreOptions & Core.TabStoreProps;

export type TabStore = TabStoreFunctions & Store<Core.TabStore>;
