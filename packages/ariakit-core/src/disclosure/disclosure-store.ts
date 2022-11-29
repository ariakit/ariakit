import { chain } from "../utils/misc";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { SetState } from "../utils/types";

export function createDisclosureStore({
  open = false,
  animated = false,
  ...partialStore
}: DisclosureStoreProps = {}): DisclosureStore {
  const initialState: DisclosureStoreState = {
    ...partialStore.getState?.(),
    open,
    animated,
    animating: !!animated && open,
    mounted: open,
    contentElement: null,
    disclosureElement: null,
  };
  const store = createStore(initialState, partialStore);

  const setup = () => {
    return chain(
      store.setup(),
      store.sync(
        (state) => {
          if (state.animated) return;
          // Reset animating to false when animation is disabled.
          store.setState("animating", false);
        },
        ["animated", "animating"]
      ),
      store.sync(
        (state, prev) => {
          if (!state.animated) return;
          const mounting = state === prev;
          const animating = mounting ? state.open : state.open !== prev.open;
          store.setState("animating", animating);
        },
        ["open", "animated"]
      ),
      store.sync(
        (state) => {
          store.setState("mounted", state.open || state.animating);
        },
        ["open", "animating"]
      )
    );
  };

  return {
    ...store,
    setup,
    setOpen: (value) => store.setState("open", value),
    show: () => store.setState("open", true),
    hide: () => store.setState("open", false),
    toggle: () => store.setState("open", (open) => !open),
    stopAnimation: () => store.setState("animating", false),
    setContentElement: (value) => store.setState("contentElement", value),
    setDisclosureElement: (value) => store.setState("disclosureElement", value),
  };
}

export type DisclosureStoreState = {
  open: boolean;
  mounted: boolean;
  animated: boolean | number;
  animating: boolean;
  contentElement: HTMLElement | null;
  disclosureElement: HTMLElement | null;
};

export type DisclosureStoreFunctions = {
  setOpen: SetState<DisclosureStoreState["open"]>;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  stopAnimation: () => void;
  setContentElement: SetState<DisclosureStoreState["contentElement"]>;
  setDisclosureElement: SetState<DisclosureStoreState["disclosureElement"]>;
};

export type DisclosureStoreOptions = StoreOptions<
  DisclosureStoreState,
  "open" | "animated"
>;

export type DisclosureStoreProps = DisclosureStoreOptions &
  StoreProps<DisclosureStoreState>;

export type DisclosureStore = DisclosureStoreFunctions &
  Store<DisclosureStoreState>;
