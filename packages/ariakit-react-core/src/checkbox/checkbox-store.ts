import {
  CheckboxStoreState,
  CheckboxStoreValue,
  CheckboxStore as CoreCheckboxStore,
  CheckboxStoreProps as CoreCheckboxStoreProps,
  createCheckboxStore,
} from "@ariakit/core/checkbox/checkbox-store";
import { BivariantCallback } from "@ariakit/core/utils/types";
import {
  Store,
  useStore,
  useStoreProps,
} from "@ariakit/react-core/utils/store";

export function useCheckboxStoreOptions<
  T extends CheckboxStoreValue = CheckboxStoreValue
>(props: CheckboxStoreProps<T>) {
  return {
    value: props.value ?? props.getState?.()?.value ?? props.defaultValue,
  };
}

export function useCheckboxStoreProps<T extends CheckboxStore>(
  store: T,
  props: CheckboxStoreProps
) {
  useStoreProps(store, props, "value", "setValue");
  return store;
}

export function useCheckboxStore<
  T extends CheckboxStoreValue = CheckboxStoreValue
>(props: CheckboxStoreProps<T> = {}): CheckboxStore<T> {
  const options = useCheckboxStoreOptions(props);
  let store = useStore(() => createCheckboxStore({ ...props, ...options }));
  store = useCheckboxStoreProps(store, props);
  return store;
}

export type { CheckboxStoreState, CheckboxStoreValue };

export type CheckboxStore<T extends CheckboxStoreValue = CheckboxStoreValue> =
  Store<CoreCheckboxStore<T>>;

export type CheckboxStoreProps<
  T extends CheckboxStoreValue = CheckboxStoreValue
> = CoreCheckboxStoreProps<T> & {
  defaultValue?: CheckboxStoreState<T>["value"];
  setValue?: BivariantCallback<(value: CheckboxStoreState<T>["value"]) => void>;
};
