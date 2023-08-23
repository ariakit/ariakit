import { useMemo } from "react";
import * as Core from "@ariakit/core/tab/tab-store";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { useCompositeStoreProps } from "../composite/composite-store.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

type Item = Core.TabStoreItem;

export function useTabStoreProps<T extends Store<Core.TabStore>>(
  store: T,
  update: () => void,
  props: TabStoreProps,
) {
  store = useCompositeStoreProps(store, update, props);
  useStoreProps(store, props, "selectedId", "setSelectedId");
  useStoreProps(store, props, "selectOnMove");
  const [panels] = useStore(() => store.panels, {});
  return useMemo(() => ({ ...store, panels }), []);
}

/**
 * Creates a tab store.
 * @see https://ariakit.org/components/tab
 * @example
 * ```jsx
 * const tab = useTabStore();
 * <TabList store={tab}>
 *   <Tab>Tab 1</Tab>
 *   <Tab>Tab 2</Tab>
 * </TabList>
 * <TabPanel store={tab}>Panel 1</TabPanel>
 * <TabPanel store={tab}>Panel 2</TabPanel>
 * ```
 */
export function useTabStore(props: TabStoreProps = {}): TabStore {
  const [store, update] = useStore(Core.createTabStore, props);
  return useTabStoreProps(store, update, props);
}

export type TabStoreItem = Item;

export interface TabStoreState
  extends Core.TabStoreState,
    CompositeStoreState<Item> {}

export interface TabStoreFunctions
  extends Core.TabStoreFunctions,
    CompositeStoreFunctions<Item> {
  panels: Store<Core.TabStoreFunctions["panels"]>;
}

export interface TabStoreOptions
  extends Core.TabStoreOptions,
    CompositeStoreOptions<Item> {
  /**
   * Function that will be called when the `selectedId` state changes.
   * @param selectedId The new selected id.
   * @example
   * function Tabs({ visibleTab, onTabChange }) {
   *   const tab = useTabStore({
   *     selectedId: visibleTab,
   *     setSelectedId: onTabChange,
   *   });
   * }
   */
  setSelectedId?: (selectedId: TabStoreState["selectedId"]) => void;
}

export type TabStoreProps = TabStoreOptions & Core.TabStoreProps;

export type TabStore = TabStoreFunctions & Store<Core.TabStore>;
