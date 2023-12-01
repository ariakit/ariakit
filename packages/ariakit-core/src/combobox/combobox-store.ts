import type {
  CompositeStoreFunctions,
  CompositeStoreItem,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { createCompositeStore } from "../composite/composite-store.js";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.js";
import { createPopoverStore } from "../popover/popover-store.js";
import { defaultValue } from "../utils/misc.js";
import { isSafari, isTouchDevice } from "../utils/platform.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import {
  batch,
  createStore,
  setup,
  sync,
  throwOnConflictingProps,
} from "../utils/store.js";
import type { PickRequired, SetState } from "../utils/types.js";

type Value = string | string[];
type MutableValue<T extends Value = Value> = T extends string ? string : T;

interface Item extends CompositeStoreItem {
  value?: string;
}

const isSafariOnMobile = isSafari() && isTouchDevice();

export function createComboboxStore<T extends Value = Value>(
  props: PickRequired<
    ComboboxStoreProps<T>,
    "selectedValue" | "defaultSelectedValue"
  >,
): ComboboxStore<T>;

export function createComboboxStore(props?: ComboboxStoreProps): ComboboxStore;

/**
 * Creates a combobox store.
 */
export function createComboboxStore(
  props: ComboboxStoreProps = {},
): ComboboxStore {
  throwOnConflictingProps(props, props.store);

  const syncState = props.store?.getState();

  const activeId = defaultValue(
    props.activeId,
    syncState?.activeId,
    props.defaultActiveId,
    null,
  );

  const composite = createCompositeStore({
    ...props,
    activeId,
    includesBaseElement: defaultValue(
      props.includesBaseElement,
      syncState?.includesBaseElement,
      true,
    ),
    orientation: defaultValue(
      props.orientation,
      syncState?.orientation,
      "vertical" as const,
    ),
    focusLoop: defaultValue(props.focusLoop, syncState?.focusLoop, true),
    focusWrap: defaultValue(props.focusWrap, syncState?.focusWrap, true),
    virtualFocus: defaultValue(
      props.virtualFocus,
      syncState?.virtualFocus,
      !isSafariOnMobile,
    ),
  });

  const popover = createPopoverStore({
    ...props,
    placement: defaultValue(
      props.placement,
      syncState?.placement,
      "bottom-start" as const,
    ),
  });

  const value = defaultValue(
    props.value,
    syncState?.value,
    props.defaultValue,
    "",
  );

  const selectedValue = defaultValue(
    props.selectedValue,
    syncState?.selectedValue,
    props.defaultSelectedValue,
    "",
  );

  const multiSelectable = Array.isArray(selectedValue);

  const initialState: ComboboxStoreState = {
    ...composite.getState(),
    ...popover.getState(),
    value,
    selectedValue,
    resetValueOnSelect: defaultValue(
      props.resetValueOnSelect,
      syncState?.resetValueOnSelect,
      multiSelectable,
    ),
    resetValueOnHide: defaultValue(
      props.resetValueOnHide,
      syncState?.resetValueOnHide,
      multiSelectable,
    ),
    activeValue: syncState?.activeValue,
  };

  const combobox = createStore(initialState, composite, popover, props.store);

  setup(combobox, () =>
    sync(combobox, ["resetValueOnHide", "mounted"], (state) => {
      if (!state.resetValueOnHide) return;
      if (state.mounted) return;
      combobox.setState("value", value);
    }),
  );

  setup(combobox, () =>
    sync(combobox, ["resetValueOnSelect", "selectedValue"], (state) => {
      if (!state.resetValueOnSelect) return;
      combobox.setState("value", value);
    }),
  );

  // Resets the state when the combobox popover is hidden.
  setup(combobox, () =>
    batch(combobox, ["mounted"], (state) => {
      if (state.mounted) return;
      combobox.setState("activeId", activeId);
      combobox.setState("moves", 0);
    }),
  );

  // When the activeId changes, but the moves count doesn't, we reset the
  // activeValue state. This is useful when the activeId changes because of
  // a mouse move interaction.
  setup(combobox, () =>
    sync(combobox, ["moves", "activeId"], (state, prevState) => {
      if (state.moves === prevState.moves) {
        combobox.setState("activeValue", undefined);
      }
    }),
  );

  // Otherwise, if the moves count changes, we update the activeValue state.
  setup(combobox, () =>
    batch(combobox, ["moves", "renderedItems"], (state, prev) => {
      if (state.moves === prev.moves) return;
      const { activeId } = combobox.getState();
      const activeItem = composite.item(activeId);
      combobox.setState("activeValue", activeItem?.value);
    }),
  );

  return {
    ...popover,
    ...composite,
    ...combobox,
    setValue: (value) => combobox.setState("value", value),
    setSelectedValue: (selectedValue) =>
      combobox.setState("selectedValue", selectedValue),
  };
}

export type ComboboxStoreItem = Item;

export type ComboboxStoreSelectedValue = Value;

export interface ComboboxStoreState<T extends Value = Value>
  extends CompositeStoreState<Item>,
    PopoverStoreState {
  /**
   * @default true
   */
  includesBaseElement: boolean;
  /**
   * The input value.
   *
   * Live examples:
   * - [Combobox with integrated
   *   filter](https://ariakit.org/examples/combobox-filtering-integrated)
   * - [Combobox with links](https://ariakit.org/examples/combobox-links)
   * - [Combobox filtering](https://ariakit.org/examples/combobox-filtering)
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   */
  value: string;
  /**
   * The value of the current active item.
   */
  activeValue: string | undefined;
  /**
   * The value of the selected item(s).
   */
  selectedValue: MutableValue<T>;
  /**
   * Whether to reset the value when the combobox popover is hidden.
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * - [Menu with Combobox](https://ariakit.org/examples/menu-combobox)
   * - [Select with Combobox](https://ariakit.org/examples/select-combobox)
   * @default false
   */
  resetValueOnHide: boolean;
  /**
   * TODO: Document this.
   */
  resetValueOnSelect: boolean;
}

export interface ComboboxStoreFunctions<T extends Value = Value>
  extends CompositeStoreFunctions<Item>,
    PopoverStoreFunctions {
  /**
   * Sets the `value` state.
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * @example
   * store.setValue("Hello world");
   * store.setValue((value) => value + "!");
   */
  setValue: SetState<ComboboxStoreState<T>["value"]>;
  /**
   * Sets the `selectedValue` state.
   */
  setSelectedValue: SetState<ComboboxStoreState<T>["selectedValue"]>;
}

export interface ComboboxStoreOptions<T extends Value = Value>
  extends StoreOptions<
      ComboboxStoreState<T>,
      | "includesBaseElement"
      | "value"
      | "selectedValue"
      | "resetValueOnHide"
      | "resetValueOnSelect"
    >,
    CompositeStoreOptions<Item>,
    PopoverStoreOptions {
  /**
   * @default null
   */
  defaultActiveId?: CompositeStoreOptions<Item>["activeId"];
  /**
   * The combobox initial value.
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * @default ""
   */
  defaultValue?: ComboboxStoreState<T>["value"];
  /**
   * The initial combobox selected value.
   */
  defaultSelectedValue?: ComboboxStoreState<T>["selectedValue"];
}

export interface ComboboxStoreProps<T extends Value = Value>
  extends ComboboxStoreOptions<T>,
    StoreProps<ComboboxStoreState<T>> {}

export interface ComboboxStore<T extends Value = Value>
  extends ComboboxStoreFunctions<T>,
    Store<ComboboxStoreState<T>> {}
