import * as Core from "@ariakit/core/radio/radio-store";
import {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
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
  const store = useStore(() => Core.createRadioStore({ ...props, ...options }));
  return useRadioStoreProps(store, props);
}

export type RadioStoreState = Core.RadioStoreState & CompositeStoreState;

export type RadioStoreFunctions = Core.RadioStoreFunctions &
  CompositeStoreFunctions;

export type RadioStoreOptions = Core.RadioStoreOptions &
  CompositeStoreOptions & {
    /**
     * The initial value of the radio group.
     */
    defaultValue?: RadioStoreState["value"];
    /**
     * Function that will be called when setting the radio `value` state.
     * @example
     * function RadioGroup({ value, onChange }) {
     *   const radio = useRadioStore({ value, setValue: onChange });
     * }
     */
    setValue?: (value: RadioStoreState["value"]) => void;
  };

export type RadioStoreProps = RadioStoreOptions & Core.RadioStoreProps;

export type RadioStore = RadioStoreFunctions & Store<Core.RadioStore>;
