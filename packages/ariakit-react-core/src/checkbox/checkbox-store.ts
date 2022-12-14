import * as Core from "@ariakit/core/checkbox/checkbox-store";
import { PickRequired, SetStateOption } from "@ariakit/core/utils/types";
import { Store, useStore, useStoreProps } from "../utils/store";

type Value = Core.CheckboxStoreValue;

export function useCheckboxStoreOptions(
  _props: CheckboxStoreProps
): Partial<CheckboxStoreOptions> {
  return {};
}

export function useCheckboxStoreProps<T extends CheckboxStore>(
  store: T,
  props: CheckboxStoreProps
) {
  useStoreProps(store, props, "value", "setValue");
  return store;
}

export function useCheckboxStore<T extends Value = Value>(
  props: PickRequired<CheckboxStoreProps<T>, "value" | "defaultValue">
): CheckboxStore<T>;

export function useCheckboxStore(props?: CheckboxStoreProps): CheckboxStore;

export function useCheckboxStore(
  props: CheckboxStoreProps = {}
): CheckboxStore {
  const store = useStore(() => Core.createCheckboxStore(props));
  return useCheckboxStoreProps(store, props);
}

export type CheckboxStoreValue = Core.CheckboxStoreValue;

export type CheckboxStoreState<T extends Value = Value> =
  Core.CheckboxStoreState<T>;

export type CheckboxStoreFunctions<T extends Value = Value> =
  Core.CheckboxStoreFunctions<T> & {
    /**
     * @example
     * ```jsx
     * <button onClick={() => store.setValue((value) => !value)}>
     *   Toggle
     * </button>
     * ```
     */
    setValue: Core.CheckboxStoreFunctions<T>["setValue"];
  };

export type CheckboxStoreOptions<T extends Value = Value> =
  Core.CheckboxStoreOptions<T> & {
    setValue?: SetStateOption<CheckboxStoreState<T>["value"]>;
  };

export type CheckboxStoreProps<T extends Value = Value> =
  CheckboxStoreOptions<T> & Core.CheckboxStoreProps<T>;

export type CheckboxStore<T extends Value = Value> = CheckboxStoreFunctions<T> &
  Store<Core.CheckboxStore<T>>;
