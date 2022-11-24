import {
  CheckboxState,
  CheckboxValue,
  CheckboxStore as CoreCheckboxStore,
  CheckboxStoreProps as CoreCheckboxStoreProps,
  createCheckboxStore,
} from "@ariakit/core/checkbox/checkbox-store";
import {
  Store,
  useStore,
  useStoreProps,
} from "@ariakit/react-core/utils/store";

export function getCheckboxDefaultState<
  T extends CheckboxValue = CheckboxValue
>(props: CheckboxStoreProps<T>) {
  return {
    value: props.value ?? props.getState?.()?.value ?? props.defaultValue,
  };
}

export function useCheckboxStoreProps<
  T extends CheckboxStore<V>,
  V extends CheckboxValue
>(store: T, props: CheckboxStoreProps<V>) {
  useStoreProps(store, props, "value", "setValue");
  return store;
}

export function useCheckboxStore<T extends CheckboxValue = CheckboxValue>(
  props: CheckboxStoreProps<T> = {}
): CheckboxStore<T> {
  let store = useStore(() =>
    createCheckboxStore({ ...props, ...getCheckboxDefaultState(props) })
  );
  store = useCheckboxStoreProps(store, props);
  return store;
}

export type { CheckboxState };

export type CheckboxStore<T extends CheckboxValue = CheckboxValue> = Store<
  CoreCheckboxStore<T>
>;

export type CheckboxStoreProps<T extends CheckboxValue = CheckboxValue> =
  CoreCheckboxStoreProps<T> & {
    defaultValue?: CheckboxState<T>["value"];
    setValue?: (value: CheckboxState<T>["value"]) => void;
  };
