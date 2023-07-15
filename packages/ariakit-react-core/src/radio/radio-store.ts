import * as Core from "@ariakit/core/radio/radio-store";
import type {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
} from "../composite/composite-store.js";
import {
  useCompositeStoreOptions,
  useCompositeStoreProps,
} from "../composite/composite-store.js";
import type { Store } from "../utils/store.js";
import { useStore, useStoreProps } from "../utils/store.js";

export function useRadioStoreOptions(props: RadioStoreProps) {
  return useCompositeStoreOptions(props);
}

export function useRadioStoreProps<T extends RadioStore>(
  store: T,
  props: RadioStoreProps,
) {
  store = useCompositeStoreProps(store, props);
  useStoreProps(store, props, "value", "setValue");
  return store;
}

/**
 * Creates a radio store.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * const radio = useRadioStore();
 * <RadioGroup store={radio}>
 *   <Radio value="Apple" />
 *   <Radio value="Orange" />
 * </RadioGroup>
 * ```
 */
export function useRadioStore(props: RadioStoreProps = {}): RadioStore {
  const options = useRadioStoreOptions(props);
  const store = useStore(() => Core.createRadioStore({ ...props, ...options }));
  return useRadioStoreProps(store, props);
}

export interface RadioStoreState
  extends Core.RadioStoreState,
    CompositeStoreState {}

export interface RadioStoreFunctions
  extends Core.RadioStoreFunctions,
    CompositeStoreFunctions {}

export interface RadioStoreOptions
  extends Core.RadioStoreOptions,
    CompositeStoreOptions {
  /**
   * Function that will be called when the `value` state changes.
   * @param value The new value.
   * @example
   * function RadioGroup({ value, onChange }) {
   *   const radio = useRadioStore({ value, setValue: onChange });
   * }
   */
  setValue?: (value: RadioStoreState["value"]) => void;
}

export type RadioStoreProps = RadioStoreOptions & Core.RadioStoreProps;

export type RadioStore = RadioStoreFunctions & Store<Core.RadioStore>;
