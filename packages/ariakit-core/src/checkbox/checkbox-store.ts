import { defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import { createStore } from "../utils/store.js";
import type { PickRequired, SetState, ToPrimitive } from "../utils/types.js";

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

export interface CheckboxStoreState<T extends Value = Value> {
  /**
   * The checked state of the checkbox.
   *
   * Live examples:
   * - [Custom Checkbox](https://ariakit.org/examples/checkbox-custom)
   */
  value: ToPrimitive<T>;
}

export interface CheckboxStoreFunctions<T extends Value = Value> {
  /**
   * Sets the `value` state.
   * @example
   * store.setValue(true);
   * store.setValue((value) => !value);
   */
  setValue: SetState<CheckboxStoreState<T>["value"]>;
}

export interface CheckboxStoreOptions<T extends Value = Value>
  extends StoreOptions<CheckboxStoreState<T>, "value"> {
  /**
   * The default value of the checkbox.
   *
   * Live examples:
   * - [Custom Checkbox](https://ariakit.org/examples/checkbox-custom)
   * - [Checkbox group](https://ariakit.org/examples/checkbox-group)
   * @default false
   */
  defaultValue?: CheckboxStoreState<T>["value"];
}

export type CheckboxStoreProps<T extends Value = Value> =
  CheckboxStoreOptions<T> & StoreProps<CheckboxStoreState<T>>;

export type CheckboxStore<T extends Value = Value> = CheckboxStoreFunctions<T> &
  Store<CheckboxStoreState<T>>;
