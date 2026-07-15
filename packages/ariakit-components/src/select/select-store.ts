import {
  batch,
  createStore,
  mergeStore,
  omit,
  setup,
  subscribe,
  sync,
  throwOnConflictingProps,
} from "@ariakit/store";
import type { Store, StoreOptions, StoreProps } from "@ariakit/store";
import { toArray, defaultValue, hasOwnProperty } from "@ariakit/utils";
import type { PickRequired, SetState } from "@ariakit/utils";
import type { ComboboxStore } from "../combobox/combobox-store.ts";
import type {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.ts";
import { createCompositeStore } from "../composite/composite-store.ts";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.ts";
import { createPopoverStore } from "../popover/popover-store.ts";

type MutableValue<T extends SelectStoreValue = SelectStoreValue> =
  T extends string ? string : T;

interface ValueWriteTracker {
  version: number;
  subscriptions: number;
  subscribeSameValue?: (listener: (key: PropertyKey) => void) => () => void;
  unsubscribeSameValue?: () => void;
}

interface StoreWithInternals extends Store {
  __unstableInternals?: {
    stores?: ReadonlyArray<Store | undefined>;
    subscribeSameValue?: (listener: (key: PropertyKey) => void) => () => void;
  };
}

const valueWriteTrackerMap = new WeakMap<object, ValueWriteTracker>();

function getValueWriteTrackers(store: Store) {
  const roots = new Map<object, StoreWithInternals>();
  const visited = new Set<object>();

  const visit = (store: StoreWithInternals) => {
    // Store objects may be spread while preserving the same internals.
    const identity = store.__unstableInternals ?? store;
    if (visited.has(identity)) return;
    visited.add(identity);

    let hasValueParent = false;
    for (const parent of store.__unstableInternals?.stores ?? []) {
      if (!parent) continue;
      if (!hasOwnProperty(parent.getState(), "value")) continue;
      hasValueParent = true;
      visit(parent);
    }
    if (!hasValueParent) {
      roots.set(identity, store);
    }
  };

  visit(store);

  const trackers: ValueWriteTracker[] = [];
  for (const [identity, root] of roots) {
    let tracker = valueWriteTrackerMap.get(identity);
    if (!tracker) {
      const nextTracker: ValueWriteTracker = {
        version: 0,
        subscriptions: 0,
        subscribeSameValue: root.__unstableInternals?.subscribeSameValue,
      };
      tracker = nextTracker;
      valueWriteTrackerMap.set(identity, nextTracker);
    }
    trackers.push(tracker);
  }
  return trackers;
}

function retainValueWriteTracker(tracker: ValueWriteTracker) {
  tracker.subscriptions += 1;
  if (tracker.subscriptions === 1) {
    tracker.unsubscribeSameValue = tracker.subscribeSameValue?.((key) => {
      if (key === "value") {
        tracker.version += 1;
      }
    });
  }
  return () => {
    tracker.subscriptions -= 1;
    if (tracker.subscriptions) return;
    tracker.unsubscribeSameValue?.();
    tracker.unsubscribeSameValue = undefined;
  };
}

function getValueWriteVersion(trackers: ValueWriteTracker[]) {
  let version = 0;
  for (const tracker of trackers) {
    version += tracker.version;
  }
  return version;
}

export function createSelectStore<
  T extends SelectStoreValue = SelectStoreValue,
>(
  props: PickRequired<SelectStoreProps<T>, "value" | "defaultValue">,
): SelectStore<T>;

export function createSelectStore(props?: SelectStoreProps): SelectStore;

export function createSelectStore({
  combobox,
  ...props
}: SelectStoreProps = {}): SelectStore {
  const store = mergeStore(
    props.store,
    omit(combobox, [
      "value",
      "items",
      "renderedItems",
      "baseElement",
      "arrowElement",
      "anchorElement",
      "contentElement",
      "popoverElement",
      "disclosureElement",
    ]),
  );

  throwOnConflictingProps(props, store);

  const syncState = store.getState();

  const composite = createCompositeStore({
    ...props,
    store,
    virtualFocus: defaultValue(
      props.virtualFocus,
      syncState.virtualFocus,
      true,
    ),
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState.includesBaseElement,
      false,
    ),
    activeId: defaultValue(
      props.activeId,
      syncState.activeId,
      props.defaultActiveId,
      null,
    ),
    orientation: defaultValue(
      props.orientation,
      syncState.orientation,
      "vertical" as const,
    ),
  });

  const popover = createPopoverStore({
    ...props,
    store,
    placement: defaultValue(
      props.placement,
      syncState.placement,
      "bottom-start" as const,
    ),
  });

  const initialValue = new String("") as "";

  const initialState: SelectStoreState = {
    ...composite.getState(),
    ...popover.getState(),
    value: defaultValue(
      props.value,
      syncState.value,
      props.defaultValue,
      initialValue,
    ),
    setValueOnMove: defaultValue(
      props.setValueOnMove,
      syncState.setValueOnMove,
      false,
    ),
    labelElement: defaultValue(syncState.labelElement, null),
    selectElement: defaultValue(syncState.selectElement, null),
    listElement: defaultValue(syncState.listElement, null),
  };

  const select = createStore(initialState, composite, popover, store);

  const valueWriteTrackers = getValueWriteTrackers(select);

  setup(select, () => {
    const releases = valueWriteTrackers.map(retainValueWriteTracker);
    return () => {
      for (const release of releases) {
        release();
      }
    };
  });

  // Automatically sets the default value if it's not set.
  setup(select, () =>
    sync(select, ["value", "items"], (state) => {
      if (state.value !== initialValue) return;
      if (!state.items.length) return;
      const item = state.items.find(
        (item) => !item.disabled && item.value != null,
      );
      if (item?.value == null) return;
      select.setState("value", item.value);
    }),
  );

  // Resets the active id to its initial state when the popover is hidden. This
  // guarantees that the active id won't be pointing to another item when the
  // popover is shown again, which would cause the selected item to not be
  // auto-focused. See test "clicking on different tab and clicking outside
  // resets the selected tab".
  setup(select, () =>
    sync(select, ["mounted"], (state) => {
      if (state.mounted) return;
      select.setState("activeId", initialState.activeId);
    }),
  );

  // Sets the active id when the value changes and the popover is hidden.
  setup(select, () =>
    sync(select, ["mounted", "items", "value"], (state) => {
      // TODO: Revisit this. See test "open with keyboard, then try to open
      // again". Probably deprecate together with using ComboboxProvider as a
      // parent of SelectProvider.
      if (combobox) return;
      if (state.mounted) return;
      const values = toArray(state.value);
      const lastValue = values[values.length - 1];
      if (lastValue == null) return;
      const item = state.items.find(
        (item) => !item.disabled && item.value === lastValue,
      );
      if (!item) return;
      select.setState("activeId", item.id);
    }),
  );

  const setValueFromItem = (item: SelectStoreItem | null | undefined) => {
    if (!item) return;
    if (item.disabled) return;
    if (item.value == null) return;
    if (select.getState().value === item.value) return;
    select.setState("value", item.value);
  };

  // Sets the select value when the active item changes by moving (which usually
  // happens when moving to an item using the keyboard).
  setup(select, () =>
    batch(select, ["setValueOnMove", "moves"], () => {
      const { activeId, items, mounted, moves, setValueOnMove, value } =
        select.getState();
      if (!setValueOnMove && mounted) return;
      if (Array.isArray(value)) return;
      if (!moves) return;
      if (!activeId) return;
      const item = composite.item(activeId);
      if (item) {
        setValueFromItem(item);
        return;
      }
      const publicItem = items.find((item) => item.id === activeId);
      if (!publicItem) return;
      if (publicItem.disabled) return;
      if (publicItem.value == null) return;

      const valueWriteVersion = getValueWriteVersion(valueWriteTrackers);
      let canceled = false;
      const stopValueSubscription = subscribe(select, ["value"], () => {
        canceled = true;
      });
      queueMicrotask(() => {
        stopValueSubscription();
        if (canceled) return;
        if (getValueWriteVersion(valueWriteTrackers) !== valueWriteVersion) {
          return;
        }
        const currentState = select.getState();
        if (currentState.moves !== moves) return;
        if (currentState.activeId !== activeId) return;
        if (currentState.value !== value) return;
        const currentItem =
          composite.item(activeId) ??
          currentState.items.find((item) => item.id === activeId);
        setValueFromItem(currentItem);
      });

      return () => {
        canceled = true;
        stopValueSubscription();
      };
    }),
  );

  const setState: SelectStore["setState"] = (key, value) => {
    if (key === "value") {
      for (const tracker of valueWriteTrackers) {
        tracker.version += 1;
      }
    }
    select.setState(key, value);
  };

  return {
    ...composite,
    ...popover,
    ...select,
    combobox,
    setState,
    setValue: (value) => setState("value", value),
    setLabelElement: (element) => select.setState("labelElement", element),
    setSelectElement: (element) => select.setState("selectElement", element),
    setListElement: (element) => select.setState("listElement", element),
  };
}

export type SelectStoreValue = string | readonly string[];

export interface SelectStoreItem extends CompositeStoreItem {
  value?: string;
}

export interface SelectStoreState<T extends SelectStoreValue = SelectStoreValue>
  extends CompositeStoreState<SelectStoreItem>, PopoverStoreState {
  /** @default true */
  virtualFocus: CompositeStoreState<SelectStoreItem>["virtualFocus"];
  /** @default null */
  activeId: CompositeStoreState<SelectStoreItem>["activeId"];
  /** @default "vertical" */
  orientation: CompositeStoreState<SelectStoreItem>["orientation"];
  /** @default "bottom-start" */
  placement: PopoverStoreState["placement"];
  /**
   * The select value.
   *
   * Live examples:
   * - [Form with Select](https://ariakit.com/examples/form-select)
   * - [Select Grid](https://ariakit.com/examples/select-grid)
   * - [Select with custom
   *   items](https://ariakit.com/examples/select-item-custom)
   * - [Multi-Select](https://ariakit.com/examples/select-multiple)
   * - [Toolbar with Select](https://ariakit.com/examples/toolbar-select)
   * - [Select with Next.js App
   *   Router](https://ariakit.com/examples/select-next-router)
   */
  value: MutableValue<T>;
  /**
   * Whether the select
   * [`value`](https://ariakit.com/reference/select-provider#value) should be
   * set when the active item changes by moving (which usually happens when
   * moving to an item using the keyboard).
   *
   * Live examples:
   * - [Select Grid](https://ariakit.com/examples/select-grid)
   * - [Select with custom
   *   items](https://ariakit.com/examples/select-item-custom)
   * @default false
   */
  setValueOnMove: boolean;
  /**
   * The select label element.
   */
  labelElement: HTMLElement | null;
  /**
   * The select button element.
   *
   * Live examples:
   * - [Form with Select](https://ariakit.com/examples/form-select)
   */
  selectElement: HTMLElement | null;
  /**
   * The select list element.
   */
  listElement: HTMLElement | null;
}

export interface SelectStoreFunctions<
  T extends SelectStoreValue = SelectStoreValue,
>
  extends
    Pick<SelectStoreOptions<T>, "combobox">,
    CompositeStoreFunctions<SelectStoreItem>,
    PopoverStoreFunctions {
  /**
   * Sets the [`value`](https://ariakit.com/reference/select-provider#value)
   * state.
   * @example
   * store.setValue("Apple");
   * store.setValue(["Apple", "Banana"]);
   * store.setValue((value) => value === "Apple" ? "Banana" : "Apple"));
   */
  setValue: SetState<SelectStoreState<T>["value"]>;
  /**
   * Sets the `labelElement` state.
   */
  setLabelElement: SetState<SelectStoreState<T>["labelElement"]>;
  /**
   * Sets the `selectElement` state.
   */
  setSelectElement: SetState<SelectStoreState<T>["selectElement"]>;
  /**
   * Sets the `listElement` state.
   */
  setListElement: SetState<SelectStoreState<T>["listElement"]>;
}

export interface SelectStoreOptions<
  T extends SelectStoreValue = SelectStoreValue,
>
  extends
    StoreOptions<
      SelectStoreState<T>,
      | "virtualFocus"
      | "activeId"
      | "orientation"
      | "placement"
      | "value"
      | "setValueOnMove"
    >,
    CompositeStoreOptions<SelectStoreItem>,
    PopoverStoreOptions {
  /**
   * A reference to a combobox store. This is used when combining the combobox
   * with a select (e.g., select with a search input). The stores will share the
   * same state.
   */
  combobox?: ComboboxStore | null;
  /**
   * The default value. If not set, the first non-disabled item will be used.
   *
   * Live examples:
   * - [Form with Select](https://ariakit.com/examples/form-select)
   * - [Animated Select](https://ariakit.com/examples/select-animated)
   * - [Select with Combobox](https://ariakit.com/examples/select-combobox)
   * - [SelectGroup](https://ariakit.com/examples/select-group)
   * - [Select with Next.js App
   *   Router](https://ariakit.com/examples/select-next-router)
   * - [Select with Combobox and
   *   Tabs](https://ariakit.com/examples/select-combobox-tab)
   */
  defaultValue?: SelectStoreState<T>["value"];
}

export interface SelectStoreProps<T extends SelectStoreValue = SelectStoreValue>
  extends SelectStoreOptions<T>, StoreProps<SelectStoreState<T>> {}

export interface SelectStore<T extends SelectStoreValue = SelectStoreValue>
  extends SelectStoreFunctions<T>, Store<SelectStoreState<T>> {}
