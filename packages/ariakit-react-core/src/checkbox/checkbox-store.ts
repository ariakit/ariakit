import * as Core from "@ariakit/core/checkbox/checkbox-store";
import { BivariantCallback } from "@ariakit/core/utils/types";
import { Store, useStore, useStoreProps } from "../utils/store";

type Value = Core.CheckboxStoreValue;

export function useCheckboxStoreOptions<T extends Value = Value>(
  props: CheckboxStoreProps<T>
) {
  const state = props.store?.getState?.();
  return {
    value: props.value ?? state?.value ?? props.defaultValue,
  };
}

export function useCheckboxStoreProps<T extends CheckboxStore>(
  store: T,
  props: CheckboxStoreProps
) {
  useStoreProps(store, props, "value", "setValue");
  return store;
}

export function useCheckboxStore<T extends Value = Value>(
  props: CheckboxStoreProps<T> = {}
): CheckboxStore<T> {
  const options = useCheckboxStoreOptions(props);
  const store = useStore(() =>
    Core.createCheckboxStore({ ...props, ...options })
  );
  return useCheckboxStoreProps(store, props);
}

export type CheckboxStoreValue = Core.CheckboxStoreValue;

export type CheckboxStoreState<T extends Value = Value> =
  Core.CheckboxStoreState<T>;

export type CheckboxStoreFunctions<T extends Value = Value> =
  Core.CheckboxStoreFunctions<T>;

export type CheckboxStoreOptions<T extends Value = Value> =
  Core.CheckboxStoreOptions<T> & {
    defaultValue?: CheckboxStoreState<T>["value"];
    setValue?: BivariantCallback<
      (value: CheckboxStoreState<T>["value"]) => void
    >;
  };

export type CheckboxStoreProps<T extends Value = Value> =
  CheckboxStoreOptions<T> & Core.CheckboxStoreProps<T>;

export type CheckboxStore<T extends Value = Value> = CheckboxStoreFunctions<T> &
  Store<Core.CheckboxStore<T>>;
