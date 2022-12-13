import {
  CompositeStoreFunctions,
  CompositeStoreOptions,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import { defaultValue } from "../utils/misc";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { SetState } from "../utils/types";

export function createRadioStore({
  ...props
}: RadioStoreProps = {}): RadioStore {
  const syncState = props.store?.getState();

  const composite = createCompositeStore({
    ...props,
    focusLoop: defaultValue(props.focusLoop, syncState?.focusLoop, true),
  });

  const initialState: RadioStoreState = {
    ...composite.getState(),
    value: defaultValue(props.value, syncState?.value, null),
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
