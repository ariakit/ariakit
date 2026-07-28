import * as Core from "@ariakit/components/select/select-store";
import { useStore, useStoreProps } from "@ariakit/react-store";
import type { Store } from "@ariakit/react-store";
import { useUpdateEffect } from "@ariakit/react-utils";
import type { BivariantCallback, PickRequired } from "@ariakit/utils";
import { useComboboxProviderContext } from "../combobox/combobox-context.tsx";
import type { ComboboxStore } from "../combobox/combobox-store.ts";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.ts";
import {
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store.ts";
import type {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
} from "../popover/popover-store.ts";
import { usePopoverStoreProps } from "../popover/popover-store.ts";

/** @deprecated Use `useComboboxStoreOptions` instead. */
export function useSelectStoreOptions<T extends Core.SelectStoreOptions>(
  props: T,
) {
  const combobox = useComboboxProviderContext();
  props = {
    ...props,
    combobox: props.combobox !== undefined ? props.combobox : combobox,
  };
  return useCompositeStoreOptions(props);
}

/** @deprecated Use `useComboboxStoreProps` instead. */
export function useSelectStoreProps<T extends Core.SelectStore>(
  store: T,
  update: () => void,
  props: SelectStoreProps,
) {
  useUpdateEffect(update, [props.combobox]);
  useStoreProps(store, props, "value", "setValue");
  useStoreProps(store, props, "setValueOnMove");
  return Object.assign(
    usePopoverStoreProps(
      useCompositeStoreProps(store, update, props),
      update,
      props,
    ),
    { combobox: props.combobox },
  );
}

/**
 * Creates a select store to control the state of
 * [Select](https://ariakit.com/components/select) components.
 * @deprecated Use
 * [`useComboboxStore`](https://ariakit.com/reference/use-combobox-store)
 * instead.
 * @see https://ariakit.com/components/select
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

/** @deprecated Use `useComboboxStore` instead. */
export function useSelectStore(props?: SelectStoreProps): SelectStore;

export function useSelectStore(props: SelectStoreProps = {}): SelectStore {
  props = useSelectStoreOptions(props);
  const [store, update] = useStore(Core.createSelectStore, props);
  return useSelectStoreProps(store, update, props);
}

/** @deprecated Use `ComboboxStoreSelectedValue` instead. */
export type SelectStoreValue = Core.SelectStoreValue;

/** @deprecated Use `ComboboxStoreItem` instead. */
export interface SelectStoreItem extends Core.SelectStoreItem {}

/** @deprecated Use `ComboboxStoreState` instead. */
export interface SelectStoreState<T extends SelectStoreValue = SelectStoreValue>
  extends
    Core.SelectStoreState<T>,
    CompositeStoreState<SelectStoreItem>,
    PopoverStoreState {}

/** @deprecated Use `ComboboxStoreFunctions` instead. */
export interface SelectStoreFunctions<
  T extends SelectStoreValue = SelectStoreValue,
>
  extends
    Pick<SelectStoreOptions<T>, "combobox" | "disclosure">,
    Omit<Core.SelectStoreFunctions<T>, "combobox" | "disclosure">,
    CompositeStoreFunctions<SelectStoreItem>,
    PopoverStoreFunctions {}

/** @deprecated Use `ComboboxStoreOptions` instead. */
export interface SelectStoreOptions<
  T extends SelectStoreValue = SelectStoreValue,
>
  extends
    Omit<Core.SelectStoreOptions<T>, "combobox" | "disclosure">,
    CompositeStoreOptions<SelectStoreItem>,
    PopoverStoreOptions {
  /**
   * Function that will be called when the
   * [`value`](https://ariakit.com/reference/select-provider#value) state
   * changes.
   */
  setValue?: BivariantCallback<(value: SelectStoreState<T>["value"]) => void>;
  /**
   * A reference to a [combobox
   * store](https://ariakit.com/reference/use-combobox-store). It's
   * automatically set when composing Select with Combobox.
   */
  combobox?: ComboboxStore | null;
}

/** @deprecated Use `ComboboxStoreProps` instead. */
export interface SelectStoreProps<T extends SelectStoreValue = SelectStoreValue>
  extends
    SelectStoreOptions<T>,
    Omit<Core.SelectStoreProps<T>, "combobox" | "disclosure"> {}

/** @deprecated Use `ComboboxStore` instead. */
export interface SelectStore<T extends SelectStoreValue = SelectStoreValue>
  extends
    SelectStoreFunctions<T>,
    Omit<Store<Core.SelectStore<T>>, "combobox" | "disclosure"> {}
