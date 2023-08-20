import * as Core from "@ariakit/core/select/select-store";
import type {
  BivariantCallback,
  PickRequired,
} from "@ariakit/core/utils/types";
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
import { useUpdateLayoutEffect } from "../utils/hooks.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

type Item = Core.SelectStoreItem;
type Value = Core.SelectStoreValue;

export function useSelectStoreProps<T extends SelectStore>(
  store: T,
  update: () => void,
  props: SelectStoreProps,
) {
  useUpdateLayoutEffect(update, [props.combobox]);
  store = useCompositeStoreProps(store, update, props);
  store = usePopoverStoreProps(store, update, props);
  useStoreProps(store, props, "value", "setValue");
  return store;
}

/**
 * Creates a select store.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectState({ defaultValue: "Apple" });
 * <Select state={select} />
 * <SelectPopover state={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export function useSelectStore<T extends Value = Value>(
  props: PickRequired<SelectStoreProps<T>, "value" | "defaultValue">,
): SelectStore<T>;

export function useSelectStore(props?: SelectStoreProps): SelectStore;

export function useSelectStore(props: SelectStoreProps = {}): SelectStore {
  const [store, update] = useStore(Core.createSelectStore, props);
  return useSelectStoreProps(store, update, props);
}

export type SelectStoreItem = Item;

export type SelectStoreValue = Value;

export interface SelectStoreState<T extends Value = Value>
  extends Core.SelectStoreState<T>,
    CompositeStoreState<Item>,
    PopoverStoreState {}

export interface SelectStoreFunctions<T extends Value = Value>
  extends Core.SelectStoreFunctions<T>,
    CompositeStoreFunctions<Item>,
    PopoverStoreFunctions {}

export interface SelectStoreOptions<T extends Value = Value>
  extends Core.SelectStoreOptions<T>,
    CompositeStoreOptions<Item>,
    PopoverStoreOptions {
  /**
   * Function that will be called when the `value` state changes.
   * @param value The new value.
   * @example
   * function MySelect({ value, onChange }) {
   *   const select = useSelectStore({ value, setValue: onChange });
   * }
   */
  setValue?: BivariantCallback<(value: SelectStoreState<T>["value"]) => void>;
}

export type SelectStoreProps<T extends Value = Value> = SelectStoreOptions<T> &
  Core.SelectStoreProps<T>;

export type SelectStore<T extends Value = Value> = SelectStoreFunctions<T> &
  Store<Core.SelectStore<T>>;
