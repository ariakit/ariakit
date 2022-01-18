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
};

type Panel = CollectionState["items"][number] & {
  id: string;
  tabId?: string | null;
};

function findEnabledTabById(items: Item[], id?: string | null) {
  return items.find((item) => item.id === id && !item.disabled && !item.dimmed);
}

function findFirstEnabledTab(items: Item[]) {
  return items.find((item) => !item.disabled && !item.dimmed);
}

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
  selectOnMove = true,
  ...props
}: TabStateProps = {}): TabState {
  const [selectedId, setSelectedId] = useControlledState(
    props.defaultSelectedId,
    props.selectedId,
    props.setSelectedId
  );
  const composite = useCompositeState({ orientation, focusLoop, ...props });
  const panels = useCollectionState<Panel>();
  const compositeRef = useLiveRef(composite);

  // Selects the active tab when selectOnMove is true. Since we're listening to
  // the moves state, but not the activeId state, this effect will run only when
  // there's a move, which is usually triggered by moving through the tabs using
  // the keyboard.
  useEffect(() => {
    if (!selectOnMove) return;
    const { activeId, items } = compositeRef.current;
    if (!activeId) return;
    const tab = findEnabledTabById(items, activeId);
    if (!tab) return;
    setSelectedId(tab.id);
  }, [composite.moves, selectOnMove, setSelectedId]);

  // Keep activeId in sync with selectedId.
  useEffect(() => {
    if (selectedId === compositeRef.current.activeId) return;
    composite.setActiveId(selectedId);
  }, [selectedId, composite.setActiveId]);

  // Automatically set selectedId if it's undefined.
  useEffect(() => {
    if (selectedId !== undefined) return;
    // First, we try to set selectedId based on the current active tab.
    const activeId = compositeRef.current.activeId;
    const tab = findEnabledTabById(composite.items, activeId);
    if (tab) {
      setSelectedId(activeId);
    }
    // If there's no active tab or the active tab is dimmed, we get the first
    // enabled tab instead.
    else {
      const firstEnabledTab = findFirstEnabledTab(composite.items);
      setSelectedId(firstEnabledTab?.id);
    }
  }, [selectedId, composite.items, setSelectedId]);

  // Keep panels tabIds in sync with the current tabs.
  useEffect(() => {
    if (!composite.items.length) return;
    panels.setItems((prevPanels) => {
      const hasOrphanPanels = prevPanels.some((panel) => !panel.tabId);
      if (!hasOrphanPanels) return prevPanels;
      return prevPanels.map((panel, i) => {
        if (panel.tabId) return panel;
        const tab = composite.items[i];
        return { ...panel, tabId: tab?.id };
      });
    });
  }, [composite.items, panels.setItems]);

  const select: TabState["select"] = useCallback(
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
      select,
      panels,
    }),
    [composite, selectedId, setSelectedId, select, panels]
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
   * Selects the tab panel for the tab with the given id.
   */
  select: TabState["move"];
  /**
   * A collection state containing the tab panels.
   */
  panels: CollectionState<Panel>;
  /**
   * Whether the tab should be selected when it receives focus. If it's set to
   * `false`, the tab will be selected only when it's clicked.
   * @default true
   */
  selectOnMove?: boolean;
};

export type TabStateProps = CompositeStateProps<Item> &
  Partial<Pick<TabState, "selectedId" | "selectOnMove">> & {
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
