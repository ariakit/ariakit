import { chain } from "../utils/misc";
import { PartialStore, Store, createStore } from "../utils/store";
import { SetState } from "../utils/types";

export function createDisclosureStore({
  open = false,
  animated = false,
  ...partialStore
}: DisclosureStoreProps = {}): DisclosureStore {
  const store = createStore<DisclosureState>(
    {
      open,
      animated,
      animating: animated && open,
      mounted: open,
      contentElement: null,
      disclosureElement: null,
      ...partialStore.getState?.(),
    },
    partialStore
  );

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

  const setOpen: DisclosureStore["setOpen"] = (value) =>
    store.setState("open", value);

  const show: DisclosureStore["show"] = () => store.setState("open", true);
  const hide: DisclosureStore["hide"] = () => store.setState("open", false);
  const toggle: DisclosureStore["toggle"] = () =>
    store.setState("open", (open) => !open);

  const stopAnimation: DisclosureStore["stopAnimation"] = () =>
    store.setState("animating", false);

  const setContentElement: DisclosureStore["setContentElement"] = (value) =>
    store.setState("contentElement", value);

  const setDisclosureElement: DisclosureStore["setDisclosureElement"] = (
    value
  ) => store.setState("disclosureElement", value);

  return {
    ...store,
    setup,
    setOpen,
    show,
    hide,
    toggle,
    stopAnimation,
    setContentElement,
    setDisclosureElement,
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
