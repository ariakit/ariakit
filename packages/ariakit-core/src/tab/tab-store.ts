import {
  CollectionStore,
  CollectionStoreItem,
  createCollectionStore,
} from "../collection/collection-store";
import {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { SetState } from "../utils/types";

type Item = CompositeStoreItem & {
  dimmed?: boolean;
};

export function createTabStore({
  orientation = "horizontal",
  focusLoop = true,
  selectedId,
  selectOnMove = true,
  ...props
}: TabStoreProps = {}): TabStore {
  const composite = createCompositeStore({ orientation, focusLoop, ...props });
  const panels = createCollectionStore<TabStorePanel>();
  const initialState: TabStoreState = {
    ...composite.getState(),
    selectedId,
    selectOnMove,
  };
  const tab = createStore(initialState, composite);

  // Selects the active tab when selectOnMove is true. Since we're listening to
  // the moves state, but not the activeId state, this callback will run only
  // when there's a move, which is usually triggered by moving through the tabs
  // using the keyboard.
  tab.setup(() =>
    tab.sync(() => {
      const { activeId, selectOnMove } = tab.getState();
      if (!selectOnMove) return;
      if (!activeId) return;
      const tabItem = composite.item(activeId);
      if (!tabItem) return;
      if (tabItem.dimmed) return;
      if (tabItem.disabled) return;
      tab.setState("selectedId", tabItem.id);
    }, ["moves"])
  );

  // Keep activeId in sync with selectedId.
  tab.setup(() =>
    tab.sync(
      (state) => tab.setState("activeId", state.selectedId),
      ["selectedId"]
    )
  );

  // Automatically set selectedId if it's undefined.
  tab.setup(() =>
    tab.sync(
      (state) => {
        if (state.selectedId !== undefined) return;
        // First, we try to set selectedId based on the current active tab.
        const { activeId, renderedItems } = tab.getState();
        const tabItem = composite.item(activeId);
        if (tabItem && !tabItem.disabled && !tabItem.dimmed) {
          tab.setState("selectedId", tabItem.id);
        }
        // If there's no active tab or the active tab is dimmed, we get the
        // first enabled tab instead.
        else {
          const tabItem = renderedItems.find(
            (item) => !item.disabled && !item.dimmed
          );
          tab.setState("selectedId", tabItem?.id);
        }
      },
      ["selectedId", "renderedItems"]
    )
  );

  // Keep panels tabIds in sync with the current tabs.
  tab.setup(() =>
    tab.sync(
      (state) => {
        const tabs = state.renderedItems;
        if (!tabs.length) return;
        return panels.sync(
          (state) => {
            const items = state.renderedItems;
            const hasOrphanPanels = items.some((panel) => !panel.tabId);
            if (!hasOrphanPanels) return;
            items.forEach((panel, i) => {
              if (panel.tabId) return;
              const tabItem = tabs[i];
              if (!tabItem) return;
              panels.renderItem({ ...panel, tabId: tabItem.id });
            });
          },
          ["renderedItems"]
        );
      },
      ["renderedItems"]
    )
  );

  return {
    ...composite,
    ...tab,
    panels,
    setSelectedId: (id) => tab.setState("selectedId", id),
    select: (id) => {
      tab.setState("selectedId", id);
      composite.move(id);
    },
  };
}

export type TabStoreItem = Item;

export type TabStorePanel = CollectionStoreItem & {
  tabId?: string | null;
};

export type TabStoreState = CompositeStoreState<Item> & {
  /**
   * The id of the tab whose panel is currently visible.
   */
  selectedId: TabStoreState["activeId"];
  /**
   * Whether the tab should be selected when it receives focus. If it's set to
   * `false`, the tab will be selected only when it's clicked.
   * @default true
   */
  selectOnMove?: boolean;
};

export type TabStoreFunctions = CompositeStoreFunctions<Item> & {
  /**
   * Sets the `selectedId` state.
   */
  setSelectedId: SetState<TabStoreState["selectedId"]>;
  /**
   * A collection store containing the tab panels.
   */
  panels: CollectionStore<TabStorePanel>;
  /**
   * Selects the tab panel for the tab with the given id.
   */
  select: TabStore["move"];
};

export type TabStoreOptions = CompositeStoreOptions<Item> &
  StoreOptions<TabStoreState, "selectedId" | "selectOnMove">;

export type TabStoreProps = TabStoreOptions & StoreProps<TabStoreState>;

export type TabStore = TabStoreFunctions & Store<TabStoreState>;
