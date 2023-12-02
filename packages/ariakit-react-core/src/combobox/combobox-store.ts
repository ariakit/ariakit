import * as Core from "@ariakit/core/combobox/combobox-store";
import type { PickRequired } from "@ariakit/core/utils/types";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import { useCompositeStoreProps } from "../composite/composite-store.js";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.js";
import { usePopoverStoreProps } from "../popover/popover-store.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

type Value = Core.ComboboxStoreSelectedValue;

export function useComboboxStoreProps<T extends Core.ComboboxStore>(
  store: T,
  update: () => void,
  props: ComboboxStoreProps,
) {
  store = usePopoverStoreProps(store, update, props);
  store = useCompositeStoreProps(store, update, props);
  useStoreProps(store, props, "value", "setValue");
  useStoreProps(store, props, "selectedValue", "setSelectedValue");
  useStoreProps(store, props, "resetValueOnHide");
  useStoreProps(store, props, "resetValueOnSelect");
  return store;
}

/**
 * Creates a combobox store.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxStore();
 * <Combobox store={combobox} />
 * <ComboboxPopover store={combobox}>
 *   <ComboboxItem value="Apple" />
 *   <ComboboxItem value="Banana" />
 *   <ComboboxItem value="Orange" />
 * </ComboboxPopover>
 * ```
 */
export function useComboboxStore<T extends Value = Value>(
  props: PickRequired<
    ComboboxStoreProps<T>,
    "selectedValue" | "defaultSelectedValue"
  >,
): ComboboxStore<T>;

export function useComboboxStore(props?: ComboboxStoreProps): ComboboxStore;

export function useComboboxStore(
  props: ComboboxStoreProps = {},
): ComboboxStore {
  const [store, update] = useStore(Core.createComboboxStore, props);
  return useComboboxStoreProps(store, update, props);
}

export type ComboboxStoreItem = Core.ComboboxStoreItem;
export type ComboboxStoreSelectedValue = Core.ComboboxStoreSelectedValue;

export interface ComboboxStoreState<T extends Value = Value>
  extends Core.ComboboxStoreState<T>,
    CompositeStoreState<ComboboxStoreItem>,
    PopoverStoreState {}

export interface ComboboxStoreFunctions<T extends Value = Value>
  extends Core.ComboboxStoreFunctions<T>,
    CompositeStoreFunctions<ComboboxStoreItem>,
    PopoverStoreFunctions {}

export interface ComboboxStoreOptions<T extends Value = Value>
  extends Core.ComboboxStoreOptions<T>,
    CompositeStoreOptions<ComboboxStoreItem>,
    PopoverStoreOptions {
  /**
   * A callback that gets called when the
   * [`value`](https://ariakit.org/reference/combobox-provider#value) state
   * changes.
   *
   * Live examples:
   * - [Combobox with integrated
   *   filter](https://ariakit.org/examples/combobox-filtering-integrated)
   * - [ComboboxGroup](https://ariakit.org/examples/combobox-group)
   * - [Combobox with links](https://ariakit.org/examples/combobox-links)
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   * - [Menu with Combobox](https://ariakit.org/examples/menu-combobox)
   * - [Select with Combobox](https://ariakit.org/examples/select-combobox)
   */
  setValue?: (value: ComboboxStoreState<T>["value"]) => void;
  /**
   * A callback that gets called when the
   * [`selectedValue`](https://ariakit.org/reference/combobox-provider#selectedvalue)
   * state changes.
   *
   * Live examples:
   * - [Multi-selectable
   *   Combobox](https://ariakit.org/examples/combobox-multiple)
   */
  setSelectedValue?: (value: ComboboxStoreState<T>["selectedValue"]) => void;
}

export interface ComboboxStoreProps<T extends Value = Value>
  extends ComboboxStoreOptions<T>,
    Core.ComboboxStoreProps<T> {}

export interface ComboboxStore<T extends Value = Value>
  extends ComboboxStoreFunctions<T>,
    Store<Core.ComboboxStore<T>> {}
