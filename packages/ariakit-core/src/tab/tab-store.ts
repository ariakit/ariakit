import {
  CollectionStore,
  CollectionStoreItem,
  createCollectionStore,
} from "../collection/collection-store.js";
import {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store.js";
import { defaultValue } from "../utils/misc.js";
import {
  Store,
  StoreOptions,
  StoreProps,
  createStore,
} from "../utils/store.js";
import { SetState } from "../utils/types.js";

type Item = CompositeStoreItem & {
  dimmed?: boolean;
};

type Panel = CollectionStoreItem & {
  tabId?: string | null;
};

export function createTabStore(props: TabStoreProps = {}): TabStore {
  const syncState = props.store?.getState();

  const composite = createCompositeStore({
    ...props,
    orientation: defaultValue(
      props.orientation,
      syncState?.orientation,
      "horizontal" as const
    ),
    focusLoop: defaultValue(props.focusLoop, syncState?.focusLoop, true),
  });

  const panels = createCollectionStore<Panel>();

  const initialState: TabStoreState = {
    ...composite.getState(),
    selectedId: defaultValue(
      props.selectedId,
      syncState?.selectedId,
      props.defaultSelectedId,
      undefined
    ),
    selectOnMove: defaultValue(
      props.selectOnMove,
      syncState?.selectOnMove,
      true
    ),
  };
  const tab = createStore(initialState, composite, props.store);

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

export type TabStorePanel = Panel;

export interface TabStoreState extends CompositeStoreState<Item> {
  /**
   * @default "horizontal"
   */
  orientation: CompositeStoreState<Item>["orientation"];
  /**
   * @default true
   */
  focusLoop: CompositeStoreState<Item>["focusLoop"];
  /**
   * The id of the tab whose panel is currently visible. If it's `undefined`, it
   * will be automatically set to the first enabled tab.
   */
  selectedId: TabStoreState["activeId"];
  /**
   * Whether the tab should be selected when it receives focus. If it's set to
   * `false`, the tab will be selected only when it's clicked.
   * @default true
   */
  selectOnMove?: boolean;
}

export interface TabStoreFunctions extends CompositeStoreFunctions<Item> {
  /**
   * Sets the `selectedId` state without moving focus. If you want to move focus,
   * use the `select` function instead.
   * @example
   * // Selects the tab with id "tab-1"
   * store.setSelectedId("tab-1");
   * // Toggles between "tab-1" and "tab-2"
   * store.setSelectedId((id) => id === "tab-1" ? "tab-2" : "tab-1"));
   * // Selects the first tab
   * store.setSelectedId(store.first());
   * // Selects the next tab
   * store.setSelectedId(store.next());
   */
  setSelectedId: SetState<TabStoreState["selectedId"]>;
  /**
   * A collection store containing the tab panels.
   */
  panels: CollectionStore<Panel>;
  /**
   * Selects the tab for the given id and moves focus to it. If you want to set
   * the `selectedId` state without moving focus, use the `setSelectedId`
   * function instead.
   * @param id The id of the tab to select.
   * @example
   * // Selects the tab with id "tab-1"
   * store.select("tab-1");
   * // Selects the first tab
   * store.select(store.first());
   * // Selects the next tab
   * store.select(store.next());
   */
  select: TabStore["move"];
}

export interface TabStoreOptions
  extends StoreOptions<
      TabStoreState,
      "orientation" | "focusLoop" | "selectedId" | "selectOnMove"
    >,
    CompositeStoreOptions<Item> {
  /**
   * The id of the tab whose panel is currently visible. If it's `undefined`, it
   * will be automatically set to the first enabled tab.
   */
  defaultSelectedId?: TabStoreState["selectedId"];
}

export type TabStoreProps = TabStoreOptions & StoreProps<TabStoreState>;

export type TabStore = TabStoreFunctions & Store<TabStoreState>;
