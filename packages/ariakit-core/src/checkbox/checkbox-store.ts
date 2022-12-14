import { defaultValue } from "../utils/misc";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { PickRequired, SetState, ToPrimitive } from "../utils/types";

type Value = boolean | string | number | Array<string | number>;

/**
 * Creates a checkbox store.
 */
export function createCheckboxStore<T extends Value = Value>(
  props: PickRequired<CheckboxStoreProps<T>, "value" | "defaultValue">
): CheckboxStore<T>;

export function createCheckboxStore(props?: CheckboxStoreProps): CheckboxStore;

export function createCheckboxStore(
  props: CheckboxStoreProps = {}
): CheckboxStore {
  const syncState = props.store?.getState();
  const initialState: CheckboxStoreState = {
    value: defaultValue(
      props.value,
      syncState?.value,
      props.defaultValue,
      false
    ),
  };
  const checkbox = createStore(initialState, props.store);
  return {
    ...checkbox,
    setValue: (value) => checkbox.setState("value", value),
  };
}

export type CheckboxStoreValue = Value;

export type CheckboxStoreState<T extends Value = Value> = {
  /**
   * The checked state of the checkbox.
   */
  value: ToPrimitive<T>;
};

export type CheckboxStoreFunctions<T extends Value = Value> = {
  /**
   * Sets the `value` state.
   */
  setValue: SetState<CheckboxStoreState<T>["value"]>;
};

export type CheckboxStoreOptions<T extends Value = Value> = StoreOptions<
  CheckboxStoreState<T>,
  "value"
> & {
  /**
   * The default value of the checkbox.
   * @default false
   */
  defaultValue?: CheckboxStoreState<T>["value"];
};

export type CheckboxStoreProps<T extends Value = Value> =
  CheckboxStoreOptions<T> & StoreProps<CheckboxStoreState<T>>;

export type CheckboxStore<T extends Value = Value> = CheckboxStoreFunctions<T> &
  Store<CheckboxStoreState<T>>;
