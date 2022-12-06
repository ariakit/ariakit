import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { SetState } from "../utils/types";

type Value = boolean | string | number | Array<string | number>;

export function createCheckboxStore<T extends Value = Value>({
  value = false as T,
  store,
}: CheckboxStoreProps<T> = {}): CheckboxStore<T> {
  const initialState: CheckboxStoreState<T> = {
    ...store?.getState(),
    value,
  };
  const checkbox = createStore(initialState, store);

  return {
    ...checkbox,
    setValue: (value) => checkbox.setState("value", value),
  };
}

export type CheckboxStoreValue = Value;

export type CheckboxStoreState<T extends Value = Value> = {
  value: T;
};

export type CheckboxStoreFunctions<T extends Value = Value> = {
  setValue: SetState<CheckboxStoreState<T>["value"]>;
};

export type CheckboxStoreOptions<T extends Value = Value> = StoreOptions<
  CheckboxStoreState<T>,
  "value"
>;

export type CheckboxStoreProps<T extends Value = Value> =
  CheckboxStoreOptions<T> & StoreProps<CheckboxStoreState<T>>;

export type CheckboxStore<T extends Value = Value> = CheckboxStoreFunctions<T> &
  Store<CheckboxStoreState<T>>;
