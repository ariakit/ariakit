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
import { toArray } from "../utils/array.ts";
import { defaultValue } from "../utils/misc.ts";
import type { Store, StoreOptions, StoreProps } from "../utils/store.ts";
import {
  batch,
  createStore,
  mergeStore,
  omit,
  setup,
  sync,
  throwOnConflictingProps,
} from "../utils/store.ts";
import type { PickRequired, SetState } from "../utils/types.ts";

type MutableValue<T extends SelectStoreValue = SelectStoreValue> =
  T extends string ? string : T;

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

  // Sets the select value when the active item changes by moving (which usually
  // happens when moving to an item using the keyboard).
  setup(select, () =>
    batch(select, ["setValueOnMove", "moves"], (state) => {
      const { mounted, value, activeId } = select.getState();
      if (!state.setValueOnMove && mounted) return;
      if (Array.isArray(value)) return;
      if (!state.moves) return;
      if (!activeId) return;
      const item = composite.item(activeId);
      if (!item || item.disabled || item.value == null) return;
      select.setState("value", item.value);
    }),
  );

  return {
    ...composite,
    ...popover,
    ...select,
    combobox,
    setValue: (value) => select.setState("value", value),
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
  extends CompositeStoreState<SelectStoreItem>,
    PopoverStoreState {
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
   * - [Form with Select](https://ariakit.org/examples/form-select)
   * - [Select Grid](https://ariakit.org/examples/select-grid)
   * - [Select with custom
   *   items](https://ariakit.org/examples/select-item-custom)
   * - [Multi-Select](https://ariakit.org/examples/select-multiple)
   * - [Toolbar with Select](https://ariakit.org/examples/toolbar-select)
   * - [Select with Next.js App
   *   Router](https://ariakit.org/examples/select-next-router)
   */
  value: MutableValue<T>;
  /**
   * Whether the select
   * [`value`](https://ariakit.org/reference/select-provider#value) should be
   * set when the active item changes by moving (which usually happens when
   * moving to an item using the keyboard).
   *
   * Live examples:
   * - [Select Grid](https://ariakit.org/examples/select-grid)
   * - [Select with custom
   *   items](https://ariakit.org/examples/select-item-custom)
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
   * - [Form with Select](https://ariakit.org/examples/form-select)
   */
  selectElement: HTMLElement | null;
  /**
   * The select list element.
   */
  listElement: HTMLElement | null;
}

export interface SelectStoreFunctions<
  T extends SelectStoreValue = SelectStoreValue,
> extends Pick<SelectStoreOptions<T>, "combobox">,
    CompositeStoreFunctions<SelectStoreItem>,
    PopoverStoreFunctions {
  /**
   * Sets the [`value`](https://ariakit.org/reference/select-provider#value)
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
> extends StoreOptions<
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
   * - [Form with Select](https://ariakit.org/examples/form-select)
   * - [Animated Select](https://ariakit.org/examples/select-animated)
   * - [Select with Combobox](https://ariakit.org/examples/select-combobox)
   * - [SelectGroup](https://ariakit.org/examples/select-group)
   * - [Select with Next.js App
   *   Router](https://ariakit.org/examples/select-next-router)
   * - [Select with Combobox and
   *   Tabs](https://ariakit.org/examples/select-combobox-tab)
   */
  defaultValue?: SelectStoreState<T>["value"];
}

export interface SelectStoreProps<T extends SelectStoreValue = SelectStoreValue>
  extends SelectStoreOptions<T>,
    StoreProps<SelectStoreState<T>> {}

export interface SelectStore<T extends SelectStoreValue = SelectStoreValue>
  extends SelectStoreFunctions<T>,
    Store<SelectStoreState<T>> {}
