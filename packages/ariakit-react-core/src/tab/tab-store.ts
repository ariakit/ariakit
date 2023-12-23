import { useMemo } from "react";
import * as Core from "@ariakit/core/tab/tab-store";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { useCompositeStoreProps } from "../composite/composite-store.js";
import { useUpdateEffect } from "../utils/hooks.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useTabStoreProps<T extends Core.TabStore>(
  store: T,
  update: () => void,
  props: TabStoreProps,
) {
  store = useCompositeStoreProps(store, update, props);
  useStoreProps(store, props, "selectedId", "setSelectedId");
  useStoreProps(store, props, "selectOnMove");

  const [panels, updatePanels] = useStore(() => store.panels, {});
  useUpdateEffect(updatePanels, [store, updatePanels]);

  return useMemo(() => ({ ...store, panels }), [store, panels]);
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

export interface TabStoreItem extends Core.TabStoreItem {}

export interface TabStoreState
  extends Core.TabStoreState,
    CompositeStoreState<TabStoreItem> {}

export interface TabStoreFunctions
  extends Core.TabStoreFunctions,
    CompositeStoreFunctions<TabStoreItem> {
  panels: Store<Core.TabStoreFunctions["panels"]>;
}

export interface TabStoreOptions
  extends Core.TabStoreOptions,
    CompositeStoreOptions<TabStoreItem> {
  /**
   * Function that will be called when the
   * [`selectedId`](https://ariakit.org/reference/tab-provider#selectedid) state
   * changes.
   *
   * Live examples:
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   */
  setSelectedId?: (selectedId: TabStoreState["selectedId"]) => void;
}

export interface TabStoreProps extends TabStoreOptions, Core.TabStoreProps {}

export interface TabStore
  extends TabStoreFunctions,
    Omit<Store<Core.TabStore>, "panels"> {}
