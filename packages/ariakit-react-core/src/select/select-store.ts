import * as Core from "@ariakit/core/select/select-store";
import { BivariantCallback } from "@ariakit/core/utils/types";
import {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store";
import {
  PopoverStoreFunctions,
  PopoverStoreOptions,
  PopoverStoreState,
  usePopoverStoreOptions,
  usePopoverStoreProps,
} from "../popover/popover-store";
import { Store, useStore, useStoreProps } from "../utils/store";

type Item = Core.SelectStoreItem;
type Value = Core.SelectStoreValue;

export function useSelectStoreOptions<T extends Value = Value>(
  props: SelectStoreProps<T>
) {
  const state = props.store?.getState?.();
  return {
    ...useCompositeStoreOptions(props),
    ...usePopoverStoreOptions(props),
    value: props.value ?? state?.value ?? props.defaultValue,
  };
}

export function useSelectStoreProps<T extends SelectStore>(
  store: T,
  props: SelectStoreProps
) {
  store = useCompositeStoreProps(store, props);
  store = usePopoverStoreProps(store, props);
  useStoreProps(store, props, "value", "setValue");
  return store;
}

export function useSelectStore<T extends Value = Value>(
  props: SelectStoreProps<T> = {}
): SelectStore<T> {
  const options = useSelectStoreOptions(props);
  const store = useStore(() =>
    Core.createSelectStore({ ...props, ...options })
  );
  return useSelectStoreProps(store, props);
}

export type SelectStoreItem = Item;

export type SelectStoreValue = Value;

export type SelectStoreState<T extends Value = Value> =
  Core.SelectStoreState<T> & CompositeStoreState<Item> & PopoverStoreState;

export type SelectStoreFunctions<T extends Value = Value> =
  Core.SelectStoreFunctions<T> &
    CompositeStoreFunctions<Item> &
    PopoverStoreFunctions;

export type SelectStoreOptions<T extends Value = Value> =
  Core.SelectStoreOptions<T> &
    CompositeStoreOptions<Item> &
    PopoverStoreOptions & {
      defaultValue?: SelectStoreState<T>["value"];
      setValue?: BivariantCallback<
        (value: SelectStoreState<T>["value"]) => void
      >;
    };

export type SelectStoreProps<T extends Value = Value> = SelectStoreOptions<T> &
  Core.SelectStoreProps<T>;

export type SelectStore<T extends Value = Value> = SelectStoreFunctions<T> &
  Store<Core.SelectStore<T>>;
