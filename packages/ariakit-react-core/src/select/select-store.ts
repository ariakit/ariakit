import * as Core from "@ariakit/core/select/select-store";
import type {
  BivariantCallback,
  PickRequired,
} from "@ariakit/core/utils/types";
import { useComboboxProviderContext } from "../combobox/combobox-context.js";
import type { ComboboxStore } from "../combobox/combobox-store.js";
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
import { useUpdateEffect } from "../utils/hooks.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useSelectStoreProps<T extends Core.SelectStore>(
  store: T,
  update: () => void,
  props: SelectStoreProps,
) {
  useUpdateEffect(update, [props.combobox]);
  store = useCompositeStoreProps(store, update, props);
  store = usePopoverStoreProps(store, update, props);
  useStoreProps(store, props, "value", "setValue");
  useStoreProps(store, props, "setValueOnMove");
  return Object.assign(store, { combobox: props.combobox });
}

/**
 * Creates a select store to control the state of
 * [Select](https://ariakit.org/components/select) components.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectStore({ defaultValue: "Apple" });
 *
 * <Select store={select} />
 * <SelectPopover store={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export function useSelectStore<T extends SelectStoreValue = SelectStoreValue>(
  props: PickRequired<SelectStoreProps<T>, "value" | "defaultValue">,
): SelectStore<T>;

export function useSelectStore(props?: SelectStoreProps): SelectStore;

export function useSelectStore(props: SelectStoreProps = {}): SelectStore {
  const combobox = useComboboxProviderContext();
  props = {
    ...props,
    combobox: props.combobox !== undefined ? props.combobox : combobox,
  };
  const [store, update] = useStore(Core.createSelectStore, props);
  return useSelectStoreProps(store, update, props);
}

export type SelectStoreValue = Core.SelectStoreValue;

export interface SelectStoreItem extends Core.SelectStoreItem {}

export interface SelectStoreState<T extends SelectStoreValue = SelectStoreValue>
  extends Core.SelectStoreState<T>,
    CompositeStoreState<SelectStoreItem>,
    PopoverStoreState {}

export interface SelectStoreFunctions<
  T extends SelectStoreValue = SelectStoreValue,
> extends Pick<SelectStoreOptions<T>, "combobox">,
    Omit<Core.SelectStoreFunctions<T>, "combobox">,
    CompositeStoreFunctions<SelectStoreItem>,
    PopoverStoreFunctions {}

export interface SelectStoreOptions<
  T extends SelectStoreValue = SelectStoreValue,
> extends Core.SelectStoreOptions<T>,
    CompositeStoreOptions<SelectStoreItem>,
    PopoverStoreOptions {
  /**
   * Function that will be called when the
   * [`value`](https://ariakit.org/reference/select-provider#value) state
   * changes.
   *
   * Live examples:
   * - [Form with Select](https://ariakit.org/examples/form-select)
   * - [Select Grid](https://ariakit.org/examples/select-grid)
   * - [Select with custom items](https://ariakit.org/examples/select-item-custom)
   * - [Multi-Select](https://ariakit.org/examples/select-multiple)
   * - [Toolbar with Select](https://ariakit.org/examples/toolbar-select)
   */
  setValue?: BivariantCallback<(value: SelectStoreState<T>["value"]) => void>;
  /**
   * A reference to a [combobox
   * store](https://ariakit.org/reference/use-combobox-store). It's
   * automatically set when composing [Select with
   * Combobox](https://ariakit.org/examples/select-combobox).
   */
  combobox?: ComboboxStore | null;
}

export interface SelectStoreProps<T extends SelectStoreValue = SelectStoreValue>
  extends SelectStoreOptions<T>,
    Omit<Core.SelectStoreProps<T>, "combobox"> {}

export interface SelectStore<T extends SelectStoreValue = SelectStoreValue>
  extends SelectStoreFunctions<T>,
    Omit<Store<Core.SelectStore<T>>, "combobox"> {}
