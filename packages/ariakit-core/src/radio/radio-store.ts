import {
  CompositeStore,
  CompositeStoreProps,
  CompositeStoreState,
  createCompositeStore,
} from "../composite/composite-store";
import { PartialStore, Store, createStore } from "../utils/store";
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
  const store = createStore(initialState, composite);

  return {
    ...composite,
    ...store,
    setValue: (value) => store.setState("value", value),
  };
}

export type RadioStoreState = CompositeStoreState & {
  /**
   * The current value of the radio group.
   */
  value: string | number | null;
};

export type RadioStore = Omit<CompositeStore, keyof Store> &
  Store<RadioStoreState> & {
    /**
     * Sets the `value` state.
     */
    setValue: SetState<RadioStoreState["value"]>;
  };

export type RadioStoreProps = Omit<CompositeStoreProps, keyof RadioStore> &
  PartialStore<RadioStoreState> &
  Partial<Pick<RadioStoreState, "value">>;
