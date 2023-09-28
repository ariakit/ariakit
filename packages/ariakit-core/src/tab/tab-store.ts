import type {
  CollectionStore,
  CollectionStoreItem,
} from "../collection/collection-store.js";
import { createCollectionStore } from "../collection/collection-store.js";
import type {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { createCompositeStore } from "../composite/composite-store.js";
import { defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import { batch, createStore, setup, sync } from "../utils/store.js";
import type { SetState } from "../utils/types.js";

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
      "horizontal" as const,
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
      undefined,
    ),
    selectOnMove: defaultValue(
      props.selectOnMove,
      syncState?.selectOnMove,
      true,
    ),
  };
  const tab = createStore(initialState, composite, props.store);

  // Selects the active tab when selectOnMove is true. Since we're listening to
  // the moves state, but not the activeId state, this callback will run only
  // when there's a move, which is usually triggered by moving through the tabs
  // using the keyboard.
  setup(tab, () =>
    sync(tab, ["moves"], () => {
      const { activeId, selectOnMove } = tab.getState();
      if (!selectOnMove) return;
      if (!activeId) return;
      const tabItem = composite.item(activeId);
      if (!tabItem) return;
      if (tabItem.dimmed) return;
      if (tabItem.disabled) return;
      tab.setState("selectedId", tabItem.id);
    }),
  );

  // Keep activeId in sync with selectedId.
  setup(tab, () =>
    batch(tab, ["selectedId"], (state) =>
      tab.setState("activeId", state.selectedId),
    ),
  );

  // Automatically set selectedId if it's undefined.
  setup(tab, () =>
    sync(tab, ["selectedId", "renderedItems"], (state) => {
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
          (item) => !item.disabled && !item.dimmed,
        );
        tab.setState("selectedId", tabItem?.id);
      }
    }),
  );

  // Keep panels tabIds in sync with the current tabs.
  setup(tab, () =>
    sync(tab, ["renderedItems"], (state) => {
      const tabs = state.renderedItems;
      if (!tabs.length) return;
      return sync(panels, ["renderedItems"], (state) => {
        const items = state.renderedItems;
        const hasOrphanPanels = items.some((panel) => !panel.tabId);
        if (!hasOrphanPanels) return;
        items.forEach((panel, i) => {
          if (panel.tabId) return;
          const tabItem = tabs[i];
          if (!tabItem) return;
          panels.renderItem({ ...panel, tabId: tabItem.id });
        });
      });
    }),
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
   *
   * Live examples:
   * - [Tab with React Router](https://ariakit.org/examples/tab-react-router)
   */
  selectedId: TabStoreState["activeId"];
  /**
   * Whether the tab should be selected when it receives focus. If it's set to
   * `false`, the tab will be selected only when it's clicked.
   *
   * Live examples:
   * - [Tab with React Router](https://ariakit.org/examples/tab-react-router)
   * @default true
   */
  selectOnMove?: boolean;
}

export interface TabStoreFunctions extends CompositeStoreFunctions<Item> {
  /**
   * Sets the `selectedId` state without moving focus. If you want to move focus,
   * use the `select` function instead.
   *
   * Live examples:
   * - [Tab with React Router](https://ariakit.org/examples/tab-react-router)
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
