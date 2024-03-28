import type {
  CollectionStore,
  CollectionStoreItem,
} from "../collection/collection-store.ts";
import { createCollectionStore } from "../collection/collection-store.ts";
import type { ComboboxStore } from "../combobox/combobox-store.ts";
import type {
  CompositeStore,
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.ts";
import { createCompositeStore } from "../composite/composite-store.ts";
import { defaultValue } from "../utils/misc.ts";
import type { Store, StoreOptions, StoreProps } from "../utils/store.ts";
import {
  batch,
  createStore,
  mergeStore,
  omit,
  setup,
  sync,
} from "../utils/store.ts";
import type { SetState } from "../utils/types.ts";

export function createTabStore({
  composite: parentComposite,
  combobox,
  ...props
}: TabStoreProps = {}): TabStore {
  const independentKeys = [
    "items",
    "renderedItems",
    "moves",
    "orientation",
    "baseElement",
    "focusLoop",
    "focusShift",
    "focusWrap",
  ] as const;

  const store = mergeStore(
    props.store,
    omit(parentComposite, independentKeys),
    omit(combobox, independentKeys),
  );
  const syncState = store?.getState();

  const composite = createCompositeStore({
    ...props,
    orientation: defaultValue(
      props.orientation,
      syncState?.orientation,
      "horizontal" as const,
    ),
    focusLoop: defaultValue(props.focusLoop, syncState?.focusLoop, true),
  });

  const panels = createCollectionStore<TabStorePanel>();

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
  const tab = createStore(initialState, composite, store);

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

export interface TabStoreItem extends CompositeStoreItem {
  dimmed?: boolean;
}

export interface TabStorePanel extends CollectionStoreItem {
  tabId?: string | null;
}

export interface TabStoreState extends CompositeStoreState<TabStoreItem> {
  /** @default "horizontal" */
  orientation: CompositeStoreState<TabStoreItem>["orientation"];
  /** @default true */
  focusLoop: CompositeStoreState<TabStoreItem>["focusLoop"];
  /**
   * The id of the tab whose panel is currently visible. If it's `undefined`, it
   * will be automatically set to the first enabled tab.
   *
   * Live examples:
   * - [Tab with React Router](https://ariakit.org/examples/tab-react-router)
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   */
  selectedId: TabStoreState["activeId"];
  /**
   * Determines if the tab should be selected when it receives focus. If set to
   * `false`, the tab will only be selected upon clicking, not when
   * using arrow keys to shift focus.
   *
   * Live examples:
   * - [Tab with React Router](https://ariakit.org/examples/tab-react-router)
   * @default true
   */
  selectOnMove?: boolean;
}

export interface TabStoreFunctions
  extends CompositeStoreFunctions<TabStoreItem> {
  /**
   * Sets the
   * [`selectedId`](https://ariakit.org/reference/tab-provider#selectedid) state
   * without moving focus. If you want to move focus, use the
   * [`select`](https://ariakit.org/reference/use-tab-store#select) function
   * instead.
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
   *
   * Live examples:
   * - [Animated TabPanel](https://ariakit.org/examples/tab-panel-animated)
   */
  panels: CollectionStore<TabStorePanel>;
  /**
   * Selects the tab for the given id and moves focus to it. If you want to set
   * the [`selectedId`](https://ariakit.org/reference/tab-provider#selectedid)
   * state without moving focus, use the
   * [`setSelectedId`](https://ariakit.org/reference/use-tab-store#setselectedid-1)
   * function instead.
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
    CompositeStoreOptions<TabStoreItem> {
  /**
   * A reference to another [composite
   * store](https://ariakit.org/reference/use-composite-store). This is used when
   * rendering tabs as part of another composite widget such as
   * [Combobox](https://ariakit.org/components/combobox) or
   * [Select](https://ariakit.org/components/select). The stores will share the
   * same state.
   */
  composite?: CompositeStore | null;
  /**
   * A reference to a [combobox
   * store](https://ariakit.org/reference/use-combobox-store). This is used when
   * rendering tabs inside a
   * [Combobox](https://ariakit.org/components/combobox).
   */
  combobox?: ComboboxStore | null;
  /**
   * The id of the tab whose panel is currently visible. If it's `undefined`, it
   * will be automatically set to the first enabled tab.
   *
   * Live examples:
   * - [Combobox with tabs](https://ariakit.org/examples/combobox-tabs)
   * - [Animated TabPanel](https://ariakit.org/examples/tab-panel-animated)
   */
  defaultSelectedId?: TabStoreState["selectedId"];
}

export interface TabStoreProps
  extends TabStoreOptions,
    StoreProps<TabStoreState> {}

export interface TabStore extends TabStoreFunctions, Store<TabStoreState> {}
