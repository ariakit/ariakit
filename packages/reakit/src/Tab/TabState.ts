import * as React from "react";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import {
  unstable_useCompositeState as useCompositeState,
  unstable_CompositeState as CompositeState,
  unstable_CompositeActions as CompositeActions,
  unstable_CompositeInitialState as CompositeInitialState
} from "../Composite/CompositeState";

export type TabState = CompositeState & {
  /**
   * The current selected tab's `id`.
   */
  selectedId?: TabState["currentId"];
  /**
   * Lists all the panels.
   */
  panels: TabState["items"];
  /**
   * Whether the tab selection should be manual.
   */
  manual: boolean;
};

export type TabActions = CompositeActions & {
  /**
   * Moves into and selects a tab by its `id`.
   */
  select: TabActions["move"];
  /**
   * Sets `selectedId`.
   */
  setSelectedId: TabActions["setCurrentId"];
  /**
   * Registers a tab panel.
   */
  registerPanel: TabActions["registerItem"];
  /**
   * Unregisters a tab panel.
   */
  unregisterPanel: TabActions["unregisterItem"];
};

export type TabInitialState = CompositeInitialState &
  Partial<Pick<TabState, "selectedId" | "manual">>;

export type TabStateReturn = TabState & TabActions;

function useUnregisterItem(
  composite: CompositeActions,
  selectedId: TabState["selectedId"],
  select: TabActions["select"]
) {
  const [id, setId] = React.useState<typeof selectedId>(null);
  const history = React.useRef<string[]>([]);

  // Asynchronously calls composite.unregisterItem so we can select another id
  // on `unregisterItem` below before composite.unregisterItem is called. This
  // is necessary so useTabState can take control over which tab is selected
  // when the current selected tab is unmounted.
  React.useEffect(() => {
    if (!id) return;
    composite.unregisterItem(id);
  }, [id, composite.unregisterItem]);

  // Keeps record of the selectedId history
  React.useEffect(() => {
    if (!selectedId) return;
    history.current = [
      selectedId,
      ...history.current.filter(i => i !== selectedId)
    ];
  }, [selectedId]);

  const unregisterItem = React.useCallback(
    (itemId: string) => {
      const filtered = history.current.filter(i => i !== itemId);
      // Sets id to get asynchronously unregistered
      setId(itemId);
      // Selects the previously selected id if the unregistered id is the
      // current one
      if (history.current[0] === itemId) {
        select(filtered[0]);
      }
      history.current = filtered;
    },
    [select]
  );

  return unregisterItem;
}

export function useTabState(
  initialState: SealedInitialState<TabInitialState> = {}
): TabStateReturn {
  const {
    selectedId: initialSelectedId,
    loop = true,
    manual = false,
    ...sealed
  } = useSealedState(initialState);

  const composite = useCompositeState({
    loop,
    currentId: initialSelectedId,
    ...sealed
  });
  const panels = useCompositeState();
  const [selectedId, setSelectedId] = React.useState(initialSelectedId);

  const select = React.useCallback(
    (id: string) => {
      setSelectedId(id);
      composite.move(id);
    },
    [composite.move]
  );

  const unregisterItem = useUnregisterItem(composite, selectedId, select);

  // If selectedId is not set, use the currentId. It still possible to have no
  // selected tab with useTabState({ selectedId: null });
  React.useEffect(() => {
    if (typeof selectedId === "undefined" && composite.currentId) {
      setSelectedId(composite.currentId);
    }
  }, [selectedId, composite.currentId]);

  return {
    ...composite,
    selectedId,
    panels: panels.items,
    manual,
    select,
    setSelectedId,
    unregisterItem,
    registerPanel: React.useCallback(panel => panels.registerItem(panel), [
      panels.registerItem
    ]),
    unregisterPanel: React.useCallback(id => panels.unregisterItem(id), [
      panels.unregisterItem
    ])
  };
}

const keys: Array<keyof TabStateReturn> = [
  ...useCompositeState.__keys,
  "selectedId",
  "panels",
  "manual",
  "select",
  "setSelectedId",
  "registerPanel",
  "unregisterPanel"
];

useTabState.__keys = keys;
