import { useMemo } from "react";
import {
  TabStore as CoreTabStore,
  TabStoreProps as CoreTabStoreProps,
  TabStoreItem,
  TabStoreState,
  createTabStore,
} from "@ariakit/core/tab/tab-store";
import { Store as CoreStore } from "@ariakit/core/utils/store";
import {
  CompositeStoreProps,
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store";
import { Store, useStore, useStoreProps } from "../utils/store";

export function useTabStoreOptions(props: TabStoreProps) {
  return {
    ...useCompositeStoreOptions(props),
    selectedId:
      props.selectedId ??
      props.getState?.().selectedId ??
      props.defaultSelectedId,
  };
}

export function useTabStoreProps<T extends Store<CoreTabStore>>(
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
  const store = useStore(() => createTabStore({ ...props, ...options }));
  return useTabStoreProps(store, props);
}

export type { TabStoreState, TabStoreItem };

export type TabStore = Store<
  CoreTabStore & {
    panels: Store<CoreTabStore["panels"]>;
  }
>;

export type TabStoreProps = Omit<
  CompositeStoreProps<TabStoreItem>,
  keyof CoreStore
> &
  CoreTabStoreProps & {
    /**
     * The id of the tab whose panel should be initially visible.
     * @example
     * ```jsx
     * const tab = useTabStore({ defaultSelectedId: "tab-1" });
     * <TabList store={tab}>
     *   <Tab id="tab-1">Tab 1</Tab>
     * </TabList>
     * <TabPanel store={tab}>Panel 1</TabPanel>
     * ```
     */
    defaultSelectedId?: TabStoreState["selectedId"];
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
