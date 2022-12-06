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
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { SetState } from "../utils/types";

type Value = string | string[];
type MutableValue<T extends Value = Value> = T extends string ? string : T;
type Item = CompositeStoreItem & {
  value?: string;
};

export function createSelectStore<T extends Value = Value>({
  virtualFocus = true,
  includesBaseElement = false,
  activeId = null,
  orientation = "vertical",
  placement = "bottom-start",
  value,
  setValueOnMove = false,
  combobox,
  ...props
}: SelectStoreProps<T> = {}): SelectStore<T> {
  const defaultValue = new String("") as MutableValue<T>;
  const comboboxStore = combobox?.omit(
    "value",
    "anchorElement",
    "baseElement",
    "contentElement",
    "popoverElement",
    "items",
    "renderedItems"
  );
  const composite = createCompositeStore({
    virtualFocus,
    includesBaseElement,
    activeId,
    orientation,
    ...props,
  });
  const popover = createPopoverStore({ placement, ...props });
  const initialState: SelectStoreState<T> = {
    ...composite.getState(),
    ...popover.getState(),
    value: value ?? defaultValue,
    setValueOnMove,
    selectElement: null,
    labelElement: null,
  };
  const select = createStore(initialState, composite, popover, comboboxStore);

  // Automatically sets the default value if it's not set.
  select.setup(() =>
    select.sync(
      (state) => {
        if (state.value !== defaultValue) return;
        if (!state.items.length) return;
        const item = state.items.find(
          (item) => !item.disabled && item.value != null
        );
        if (item?.value == null) return;
        select.setState("value", item.value as MutableValue<T>);
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
        select.setState("value", item.value as MutableValue<T>);
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
    };

export type SelectStoreProps<T extends Value = Value> = SelectStoreOptions<T> &
  StoreProps<SelectStoreState<T>>;

export type SelectStore<T extends Value = Value> = SelectStoreFunctions<T> &
  Store<SelectStoreState<T>>;
