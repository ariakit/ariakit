import { chain } from "../utils/misc";
import { PartialStore, Store, createStore } from "../utils/store";
import { SetState } from "../utils/types";

export function createDisclosureStore({
  open = false,
  animated = false,
  ...partialStore
}: DisclosureStoreProps = {}): DisclosureStore {
  const initialState: DisclosureState = {
    ...partialStore.getState?.(),
    open,
    animated,
    animating: animated && open,
    mounted: open,
    contentElement: null,
    disclosureElement: null,
  };
  const store = createStore(initialState, partialStore);

  const setup = () => {
    return chain(
      store.setup(),
      store.sync(
        (state) => store.setState("mounted", state.open || state.animating),
        ["open", "animating"]
      ),
      store.sync(
        (state, prev) => {
          if (!state.animated) return;
          const mounting = state === prev;
          const animating = mounting ? state.open : state.open !== prev.open;
          store.setState("animating", animating);
        },
        ["open", "animated"]
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

export type DisclosureState = {
  open: boolean;
  mounted: boolean;
  animated: boolean;
  animating: boolean;
  contentElement: HTMLElement | null;
  disclosureElement: HTMLElement | null;
};

export type DisclosureStore = Store<DisclosureState> & {
  setOpen: SetState<DisclosureState["open"]>;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  stopAnimation: () => void;
  setContentElement: SetState<DisclosureState["contentElement"]>;
  setDisclosureElement: SetState<DisclosureState["disclosureElement"]>;
};

export type DisclosureStoreProps = PartialStore<DisclosureState> &
  Partial<Pick<DisclosureState, "open" | "animated">>;
