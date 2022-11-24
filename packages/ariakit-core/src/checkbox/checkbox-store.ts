import { PartialStore, Store, createStore } from "../utils/store";
import { SetState } from "../utils/types";

export function createCheckboxStore<T extends CheckboxValue = CheckboxValue>({
  value = false as T,
  ...partialStore
}: CheckboxStoreProps<T> = {}): CheckboxStore<T> {
  const initialState: CheckboxState<T> = {
    ...partialStore?.getState?.(),
    value,
  };
  const store = createStore(initialState, partialStore);

  const setValue: CheckboxStore<T>["setValue"] = (value) =>
    store.setState("value", value);

  return { ...store, setValue };
}

export type CheckboxValue = boolean | string | number | Array<string | number>;

export type CheckboxState<T extends CheckboxValue = CheckboxValue> = {
  value: T;
};

export type CheckboxStore<T extends CheckboxValue = CheckboxValue> = Store<
  CheckboxState<T>
> & {
  setValue: SetState<CheckboxState<T>["value"]>;
};

export type CheckboxStoreProps<T extends CheckboxValue = CheckboxValue> =
  PartialStore<CheckboxState<T>> & Partial<Pick<CheckboxState<T>, "value">>;
