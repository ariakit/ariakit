import { defaultValue } from "@ariakit/core/utils/misc";
import {
  Store as CoreStore,
  StoreOptions,
  StoreProps,
  createStore,
} from "@ariakit/core/utils/store";
import { SetState } from "@ariakit/core/utils/types";
import {
  Store,
  useStore,
  useStoreProps,
} from "@ariakit/react-core/utils/store";

export function usePlaygroundStore(
  props: PlaygroundStoreProps = {}
): PlaygroundStore {
  const store = useStore(() => {
    const syncState = props.store?.getState();

    const values = defaultValue(
      props.values,
      syncState?.values,
      props.defaultValues,
      {} as PlaygroundStoreState["values"]
    );

    const initialState: PlaygroundStoreState = { values };

    const playground = createStore(initialState, props.store);

    const setValues: PlaygroundStoreFunctions["setValues"] = (values) =>
      playground.setState("values", values);

    const setValue: PlaygroundStoreFunctions["setValue"] = (file, value) =>
      playground.setState("values", (values) => ({
        ...values,
        [file]: value,
      }));

    return { ...playground, setValues, setValue };
  });

  useStoreProps(store, props, "values", "setValues");

  return store;
}

export interface PlaygroundStoreState {
  values: Record<string, string>;
}

export interface PlaygroundStoreFunctions {
  setValues: SetState<PlaygroundStoreState["values"]>;
  setValue: (file: string, value: string) => void;
}

export interface PlaygroundStoreOptions
  extends StoreOptions<PlaygroundStoreState, "values"> {
  defaultValues?: PlaygroundStoreState["values"];
  setValues?: (values: PlaygroundStoreState["values"]) => void;
}

export type PlaygroundStoreProps = PlaygroundStoreOptions &
  StoreProps<PlaygroundStoreState>;

export type PlaygroundStore = PlaygroundStoreFunctions &
  Store<CoreStore<PlaygroundStoreState>>;
