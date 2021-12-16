import { useCallback, useEffect, useMemo } from "react";
import { useControlledState, useLiveRef } from "ariakit-utils/hooks";
import { useStorePublisher } from "ariakit-utils/store";
import { SetState } from "ariakit-utils/types";
import {
  CollectionState,
  useCollectionState,
} from "../collection/collection-state";
import {
  CompositeState,
  CompositeStateProps,
  useCompositeState,
} from "../composite/composite-state";

type Item = CompositeState["items"][number] & {
  dimmed?: boolean;
  panelId?: string | null;
};

type Panel = CollectionState["items"][number] & {
  id: string;
  tabId?: string | null;
};

/**
 * Provides state for the `Tab` components.
 * @example
 * ```jsx
 * const tab = useTabState();
 * <TabList state={tab}>
 *   <Tab>Tab 1</Tab>
 *   <Tab>Tab 2</Tab>
 * </TabList>
 * <TabPanel state={tab}>Panel 1</TabPanel>
 * <TabPanel state={tab}>Panel 2</TabPanel>
 * ```
 */
export function useTabState({
  orientation = "horizontal",
  focusLoop = true,
  ...props
}: TabStateProps = {}): TabState {
  const [selectedId, setSelectedId] = useControlledState(
    props.defaultSelectedId,
    props.selectedId,
    props.setSelectedId
  );
  const composite = useCompositeState({ orientation, focusLoop, ...props });
  const panels = useCollectionState<Panel>();
  const activeIdRef = useLiveRef(composite.activeId);

  // Keep activeId in sync with selectedId.
  useEffect(() => {
    if (selectedId === activeIdRef.current) return;
    composite.setActiveId(selectedId);
  }, [selectedId, composite.setActiveId]);

  // Automatically set selectedId if it's undefined.
  useEffect(() => {
    if (selectedId !== undefined) return;
    // First, we try to set selectedId based on the current active tab.
    const activeId = activeIdRef.current;
    const activeTab = composite.items.find((item) => item.id === activeId);
    if (activeTab && !activeTab.dimmed) {
      setSelectedId(activeId);
    }
    // If there's no active tab or the active tab is dimmed, we get the first
    // enabled tab instead.
    else {
      const firstEnabledTab = composite.items.find((item) => !item.dimmed);
      setSelectedId(firstEnabledTab?.id);
    }
  }, [selectedId, composite.items, setSelectedId]);

  // Keep tabs panelIds in sync with the current panels.
  useEffect(() => {
    // Initially, panels will be empty, so we wait until they are populated.
    if (!panels.items.length) return;
    composite.setItems((prevTabs) => {
      const hasOrphanTabs = prevTabs.some((tab) => !tab.panelId);
      // If all tabs have a panelId, we don't need to do anything.
      if (!hasOrphanTabs) return prevTabs;
      return prevTabs.map((tab, i) => {
        // If the tab has a panelId, we don't need to do anything.
        if (tab.panelId) return tab;
        // If there's already a panel with tabId pointing to this tab, use it.
        let panel = panels.items.find((item) => item.tabId === tab.id);
        // Otherwise, get the panel based on the index.
        panel = panel || panels.items[i];
        return { ...tab, panelId: panel?.id };
      });
    });
  }, [panels.items, composite.setItems]);

  // Keep panels tabIds in sync with the current tabs.
  useEffect(() => {
    if (!composite.items.length) return;
    panels.setItems((prevPanels) => {
      const hasOrphanPanels = prevPanels.some((panel) => !panel.tabId);
      if (!hasOrphanPanels) return prevPanels;
      return prevPanels.map((panel, i) => {
        if (panel.tabId) return panel;
        let tab = composite.items.find((item) => item.panelId === panel.id);
        tab = tab || composite.items[i];
        return { ...panel, tabId: tab?.id };
      });
    });
  }, [composite.items, panels.setItems]);

  const show: TabState["show"] = useCallback(
    (id) => {
      composite.move(id);
      setSelectedId(id);
    },
    [composite.move, setSelectedId]
  );

  const state = useMemo(
    () => ({
      ...composite,
      selectedId,
      setSelectedId,
      show,
      panels,
    }),
    [composite, selectedId, setSelectedId, show, panels]
  );

  return useStorePublisher(state);
}

export type TabState = CompositeState<Item> & {
  /**
   * The id of the tab whose panel is currently visible.
   */
  selectedId: TabState["activeId"];
  /**
   * Sets the `selectedId` state.
   */
  setSelectedId: SetState<TabState["selectedId"]>;
  /**
   * Shows the tab panel for the tab with the given id.
   */
  show: TabState["move"];
  /**
   * A collection state containing the tab panels.
   */
  panels: CollectionState<Panel>;
};

export type TabStateProps = CompositeStateProps<Item> &
  Partial<Pick<TabState, "selectedId">> & {
    /**
     * The id of the tab whose panel should be initially visible.
     * @example
     * ```jsx
     * const tab = useTabState({ defaultSelectedId: "tab-1" });
     * <TabList state={tab}>
     *   <Tab id="tab-1">Tab 1</Tab>
     * </TabList>
     * <TabPanel state={tab}>Panel 1</TabPanel>
     * ```
     */
    defaultSelectedId?: TabState["selectedId"];
    /**
     * Function that will be called when setting the tab `selectedId` state.
     * @example
     * function Tabs({ visibleTab, onTabChange }) {
     *   const tab = useTabState({
     *     selectedId: visibleTab,
     *     setSelectedId: onTabChange,
     *   });
     * }
     */
    setSelectedId?: (selectedId: TabState["selectedId"]) => void;
  };
