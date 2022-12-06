import {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { SetState } from "../utils/types";

export function createRadioStore({
  focusLoop = true,
  ...props
}: RadioStoreProps = {}): RadioStore {
  const composite = createCompositeStore({ focusLoop, ...props });
  const initialState: RadioStoreState = {
    ...composite.getState(),
    value: null,
  };
  const radio = createStore(initialState, composite);

  return {
    ...composite,
    ...radio,
    setValue: (value) => radio.setState("value", value),
  };
}

export type RadioStoreState = CompositeStoreState & {
  /**
   * The current value of the radio group.
   */
  value: string | number | null;
};

export type RadioStoreFunctions = CompositeStoreFunctions & {
  /**
   * Sets the `value` state.
   */
  setValue: SetState<RadioStoreState["value"]>;
};

export type RadioStoreOptions = CompositeStoreOptions &
  StoreOptions<RadioStoreState, "value">;

export type RadioStoreProps = RadioStoreOptions & StoreProps<RadioStoreState>;

export type RadioStore = RadioStoreFunctions & Store<RadioStoreState>;
