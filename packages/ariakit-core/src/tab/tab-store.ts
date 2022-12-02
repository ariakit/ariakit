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
  const store = createStore(initialState, composite);

  // Selects the active tab when selectOnMove is true. Since we're listening to
  // the moves state, but not the activeId state, this callback will run only
  // when there's a move, which is usually triggered by moving through the tabs
  // using the keyboard.
  store.setup(() =>
    store.sync(() => {
      const { activeId, selectOnMove } = store.getState();
      if (!selectOnMove) return;
      if (!activeId) return;
      const tab = composite.item(activeId);
      if (!tab) return;
      if (tab.dimmed) return;
      if (tab.disabled) return;
      store.setState("selectedId", tab.id);
    }, ["moves"])
  );

  // Keep activeId in sync with selectedId.
  store.setup(() =>
    store.sync(
      (state) => store.setState("activeId", state.selectedId),
      ["selectedId"]
    )
  );

  // Automatically set selectedId if it's undefined.
  store.setup(() =>
    store.sync(
      (state) => {
        if (state.selectedId !== undefined) return;
        // First, we try to set selectedId based on the current active tab.
        const { activeId, renderedItems } = store.getState();
        const tab = composite.item(activeId);
        if (tab && !tab.disabled && !tab.dimmed) {
          store.setState("selectedId", tab.id);
        }
        // If there's no active tab or the active tab is dimmed, we get the
        // first enabled tab instead.
        else {
          const tab = renderedItems.find(
            (item) => !item.disabled && !item.dimmed
          );
          store.setState("selectedId", tab?.id);
        }
      },
      ["selectedId", "renderedItems"]
    )
  );

  // Keep panels tabIds in sync with the current tabs.
  store.setup(() =>
    store.sync(
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
              const tab = tabs[i];
              if (!tab) return;
              panels.renderItem({ ...panel, tabId: tab.id });
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
    ...store,
    panels,
    setSelectedId: (id) => store.setState("selectedId", id),
    select: (id) => {
      store.setState("selectedId", id);
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
