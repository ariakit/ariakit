import { ComboboxStore } from "../combobox/combobox-store";
import {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
  createPopoverStore,
} from "../popover/popover-store";
import { toArray } from "../utils/array";
import { defaultValue } from "../utils/misc";
import {
  Store,
  StoreOptions,
  StoreProps,
  createStore,
  mergeStore,
} from "../utils/store";
import { PickRequired, SetState } from "../utils/types";

type Value = string | string[];
type MutableValue<T extends Value = Value> = T extends string ? string : T;
type Item = CompositeStoreItem & {
  value?: string;
};

export function createSelectStore<T extends Value = Value>(
  props: PickRequired<SelectStoreProps<T>, "value" | "defaultValue">
): SelectStore<T>;

export function createSelectStore(props?: SelectStoreProps): SelectStore;

export function createSelectStore({
  combobox,
  ...props
}: SelectStoreProps = {}): SelectStore {
  const store = mergeStore(
    props.store,
    combobox?.omit(
      "value",
      "items",
      "renderedItems",
      "baseElement",
      "arrowElement",
      "anchorElement",
      "contentElement",
      "popoverElement",
      "disclosureElement"
    )
  );
  const syncState = store.getState();

  const composite = createCompositeStore({
    ...props,
    store,
    virtualFocus: defaultValue(
      props.virtualFocus,
      syncState.virtualFocus,
      true
    ),
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState.includesBaseElement,
      false
    ),
    activeId: defaultValue(
      props.activeId,
      syncState.activeId,
      props.defaultActiveId,
      null
    ),
    orientation: defaultValue(
      props.orientation,
      syncState.orientation,
      "vertical" as const
    ),
  });

  const popover = createPopoverStore({
    ...props,
    store,
    placement: defaultValue(
      props.placement,
      syncState.placement,
      "bottom-start" as const
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
      initialValue
    ),
    setValueOnMove: defaultValue(
      props.setValueOnMove,
      syncState.setValueOnMove,
      false
    ),
    selectElement: defaultValue(syncState.selectElement, null),
    labelElement: defaultValue(syncState.labelElement, null),
  };

  const select = createStore(initialState, composite, popover, store);

  // Automatically sets the default value if it's not set.
  select.setup(() =>
    select.sync(
      (state) => {
        if (state.value !== initialValue) return;
        if (!state.items.length) return;
        const item = state.items.find(
          (item) => !item.disabled && item.value != null
        );
        if (item?.value == null) return;
        select.setState("value", item.value);
      },
      ["value", "items"]
    )
  );

  // Sets the active id when the value changes and the popover is hidden.
  select.setup(() =>
    select.sync(
      (state) => {
        if (state.mounted) return;
        const values = toArray(state.value);
        const lastValue = values[values.length - 1];
        if (lastValue == null) return;
        const item = state.items.find(
          (item) => !item.disabled && item.value === lastValue
        );
        if (!item) return;
        // TODO: This may be problematic.
        select.setState("activeId", item.id);
      },
      ["mounted", "items", "value"]
    )
  );

  // Sets the select value when the active item changes by moving (which usually
  // happens when moving to an item using the keyboard).
  select.setup(() =>
    select.batchSync(
      (state) => {
        const { mounted, value, activeId } = select.getState();
        if (!state.setValueOnMove && mounted) return;
        if (Array.isArray(value)) return;
        if (!state.moves) return;
        if (!activeId) return;
        const item = composite.item(activeId);
        if (!item || item.disabled || item.value == null) return;
        select.setState("value", item.value);
      },
      ["setValueOnMove", "moves"]
    )
  );

  return {
    ...composite,
    ...popover,
    ...select,
    setValue: (value) => select.setState("value", value),
    setSelectElement: (element) => select.setState("selectElement", element),
    setLabelElement: (element) => select.setState("labelElement", element),
  };
}

export type SelectStoreItem = Item;

export type SelectStoreValue = Value;

export type SelectStoreState<T extends Value = Value> =
  CompositeStoreState<Item> &
    PopoverStoreState & {
      /**
       * The select value.
       */
      value: MutableValue<T>;
      /**
       * Whether the select value should be set when the active item changes by
       * moving (which usually happens when moving to an item using the keyboard).
       * @default false
       */
      setValueOnMove: boolean;
      /**
       * The select button element.
       */
      selectElement: HTMLElement | null;
      /**
       * The select label element.
       */
      labelElement: HTMLElement | null;
    };

export type SelectStoreFunctions<T extends Value = Value> =
  CompositeStoreFunctions<Item> &
    PopoverStoreFunctions & {
      setValue: SetState<SelectStoreState<T>["value"]>;
      setSelectElement: SetState<SelectStoreState<T>["selectElement"]>;
      setLabelElement: SetState<SelectStoreState<T>["labelElement"]>;
    };

export type SelectStoreOptions<T extends Value = Value> =
  CompositeStoreOptions<Item> &
    PopoverStoreOptions &
    StoreOptions<SelectStoreState<T>, "value" | "setValueOnMove"> & {
      combobox?: ComboboxStore;
      defaultValue?: SelectStoreState<T>["value"];
    };

export type SelectStoreProps<T extends Value = Value> = SelectStoreOptions<T> &
  StoreProps<SelectStoreState<T>>;

export type SelectStore<T extends Value = Value> = SelectStoreFunctions<T> &
  Store<SelectStoreState<T>>;
