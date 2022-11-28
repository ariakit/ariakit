import {
  RadioStore as CoreRadioStore,
  RadioStoreProps as CoreRadioStoreProps,
  RadioStoreState,
  createRadioStore,
} from "@ariakit/core/radio/radio-store";
import { Store as CoreStore } from "@ariakit/core/utils/store";
import {
  CompositeStoreProps,
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store";
import { Store, useStore, useStoreProps } from "../utils/store";

export function useRadioStoreOptions(props: RadioStoreProps) {
  return {
    ...useCompositeStoreOptions(props),
    value: props.value ?? props.getState?.().value ?? props.defaultValue,
  };
}

export function useRadioStoreProps<
  T extends Omit<RadioStore, "useValue" | "useValidate" | "useSubmit">
>(store: T, props: RadioStoreProps) {
  store = useCompositeStoreProps(store, props);
  useStoreProps(store, props, "value", "setValue");
  return store;
}

export function useRadioStore(props: RadioStoreProps = {}): RadioStore {
  const options = useRadioStoreOptions(props);
  const store = useStore(() => createRadioStore({ ...props, ...options }));
  return useRadioStoreProps(store, props);
}

export type { RadioStoreState };

export type RadioStore = Store<CoreRadioStore>;

export type RadioStoreProps = Omit<CompositeStoreProps, keyof CoreStore> &
  CoreRadioStoreProps & {
    /**
     * The initial value of the radio group.
     */
    defaultValue?: RadioStoreState["value"];
    /**
     * Function that will be called when setting the radio `value` state.
     * @example
     * function RadioGroup({ value, onChange }) {
     *   const radio = useRadioState({ value, setValue: onChange });
     * }
     */
    setValue?: (value: RadioStoreState["value"]) => void;
  };
