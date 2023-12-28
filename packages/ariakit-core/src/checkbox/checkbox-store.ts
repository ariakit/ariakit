import { defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import { createStore, throwOnConflictingProps } from "../utils/store.js";
import type { PickRequired, SetState, ToPrimitive } from "../utils/types.js";

/**
 * Creates a checkbox store.
 */
export function createCheckboxStore<
  T extends CheckboxStoreValue = CheckboxStoreValue,
>(
  props: PickRequired<CheckboxStoreProps<T>, "value" | "defaultValue">,
): CheckboxStore<T>;

export function createCheckboxStore(props?: CheckboxStoreProps): CheckboxStore;

export function createCheckboxStore(
  props: CheckboxStoreProps = {},
): CheckboxStore {
  throwOnConflictingProps(props, props.store);

  const syncState = props.store?.getState();
  const initialState: CheckboxStoreState = {
    value: defaultValue(
      props.value,
      syncState?.value,
      props.defaultValue,
      false,
    ),
  };
  const checkbox = createStore(initialState, props.store);
  return {
    ...checkbox,
    setValue: (value) => checkbox.setState("value", value),
  };
}

export type CheckboxStoreValue =
  | boolean
  | string
  | number
  | Array<string | number>;

export interface CheckboxStoreState<
  T extends CheckboxStoreValue = CheckboxStoreValue,
> {
  /**
   * The checked state of the checkbox.
   *
   * Live examples:
   * - [Custom Checkbox](https://ariakit.org/examples/checkbox-custom)
   */
  value: ToPrimitive<T>;
}

export interface CheckboxStoreFunctions<
  T extends CheckboxStoreValue = CheckboxStoreValue,
> {
  /**
   * Sets the [`value`](https://ariakit.org/reference/checkbox-provider#value)
   * state.
   * @example
   * store.setValue(true);
   * store.setValue((value) => !value);
   */
  setValue: SetState<CheckboxStoreState<T>["value"]>;
}

export interface CheckboxStoreOptions<
  T extends CheckboxStoreValue = CheckboxStoreValue,
> extends StoreOptions<CheckboxStoreState<T>, "value"> {
  /**
   * The default
   * [`value`](https://ariakit.org/reference/checkbox-provider#value) state of
   * the checkbox.
   *
   * Live examples:
   * - [Custom Checkbox](https://ariakit.org/examples/checkbox-custom)
   * - [Checkbox group](https://ariakit.org/examples/checkbox-group)
   * @default false
   */
  defaultValue?: CheckboxStoreState<T>["value"];
}

export interface CheckboxStoreProps<
  T extends CheckboxStoreValue = CheckboxStoreValue,
> extends CheckboxStoreOptions<T>,
    StoreProps<CheckboxStoreState<T>> {}

export interface CheckboxStore<
  T extends CheckboxStoreValue = CheckboxStoreValue,
> extends CheckboxStoreFunctions<T>,
    Store<CheckboxStoreState<T>> {}
