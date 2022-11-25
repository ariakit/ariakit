import { PartialStore, Store, createStore } from "../utils/store";
import { SetState } from "../utils/types";

export function createCheckboxStore<
  T extends CheckboxStoreValue = CheckboxStoreValue
>({
  value = false as T,
  ...partialStore
}: CheckboxStoreProps<T> = {}): CheckboxStore<T> {
  const initialState: CheckboxStoreState<T> = {
    ...partialStore?.getState?.(),
    value,
  };
  const store = createStore(initialState, partialStore);

  return {
    ...store,
    setValue: (value) => store.setState("value", value),
  };
}

export type CheckboxStoreValue =
  | boolean
  | string
  | number
  | Array<string | number>;

export type CheckboxStoreState<
  T extends CheckboxStoreValue = CheckboxStoreValue
> = {
  value: T;
};

export type CheckboxStore<T extends CheckboxStoreValue = CheckboxStoreValue> =
  Store<CheckboxStoreState<T>> & {
    setValue: SetState<CheckboxStoreState<T>["value"]>;
  };

export type CheckboxStoreProps<
  T extends CheckboxStoreValue = CheckboxStoreValue
> = PartialStore<CheckboxStoreState<T>> &
  Partial<Pick<CheckboxStoreState<T>, "value">>;
