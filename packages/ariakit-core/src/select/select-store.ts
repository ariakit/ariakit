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

type Value = string | string[];
type MutableValue<T extends Value = Value> = T extends string ? string : T;
type Item = CompositeStoreItem & {
  value?: string;
};

function isComboboxStoreProps<T extends SelectStoreProps>(
  props: T
): props is T & Pick<ComboboxStore, "omit"> {
  if (!props.omit) return false;
  if (!props.getState) return false;
  const state = props.getState();
  return "value" in state && "activeValue" in state;
}

export function createSelectStore<T extends Value = Value>({
  virtualFocus = true,
  includesBaseElement = false,
  activeId = null,
  orientation = "vertical",
  placement = "bottom-start",
  value,
  setValueOnMove = false,
  ...props
}: SelectStoreProps<T> = {}): SelectStore<T> {
  if (isComboboxStoreProps(props)) {
    props = { ...props, ...props.omit("value", "contentElement") };
  }
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
    value,
    setValueOnMove,
    selectElement: null,
    labelElement: null,
  };
  const store = createStore(initialState, composite, popover);

  // Automatically sets the default value if it's not set.
  store.setup(() =>
    store.sync(
      (state) => {
        if (state.value != null) return;
        if (!state.items.length) return;
        const item = state.items.find(
          (item) => !item.disabled && item.value != null
        );
        if (item?.value == null) return;
        store.setState("value", item.value as MutableValue<T>);
      },
      ["value", "items"]
    )
  );

  // Sets the active id when the value changes and the popover is hidden.
  store.setup(() =>
    store.sync(
      (state) => {
        if (state.mounted) return;
        const values = toArray(state.value);
        const lastValue = values[values.length - 1];
        if (lastValue == null) return;
        const item = state.items.find(
          (item) => !item.disabled && item.value === lastValue
        );
        if (!item) return;
        store.setState("activeId", item.id);
      },
      ["mounted", "items", "value"]
    )
  );

  // Sets the select value when the active item changes by moving (which usually
  // happens when moving to an item using the keyboard).
  store.setup(() =>
    store.sync(
      (state) => {
        const { mounted, value, activeId } = store.getState();
        if (!state.setValueOnMove && mounted) return;
        if (Array.isArray(value)) return;
        if (!state.moves) return;
        if (!activeId) return;
        const item = composite.item(activeId);
        if (!item || item.disabled || item.value == null) return;
        store.setState("value", item.value as MutableValue<T>);
      },
      ["setValueOnMove", "moves"]
    )
  );

  return {
    ...composite,
    ...popover,
    ...store,
    setValue: (value) => store.setState("value", value),
    setSelectElement: (element) => store.setState("selectElement", element),
    setLabelElement: (element) => store.setState("labelElement", element),
  };
}

export type SelectStoreItem = Item;

export type SelectStoreValues = Record<
  string,
  string | boolean | number | Array<string | number>
>;

export type SelectStoreState<T extends Value = Value> =
  CompositeStoreState<Item> &
    PopoverStoreState & {
      /**
       * The select value.
       */
      value?: MutableValue<T>;
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
      setValue: (value: SelectStoreState<T>["value"]) => void;
      setSelectElement: (element: SelectStoreState<T>["selectElement"]) => void;
      setLabelElement: (element: SelectStoreState<T>["labelElement"]) => void;
    };

export type SelectStoreOptions<T extends Value = Value> =
  CompositeStoreOptions<Item> &
    PopoverStoreOptions &
    StoreOptions<SelectStoreState<T>, "value" | "setValueOnMove">;

export type SelectStoreProps<T extends Value = Value> = SelectStoreOptions<T> &
  StoreProps<SelectStoreState<T>>;

export type SelectStore<T extends Value = Value> = SelectStoreFunctions<T> &
  Store<SelectStoreState<T>>;
