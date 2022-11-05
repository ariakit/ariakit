import { chain } from "ariakit-utils/misc";
import { Store, createStore } from "ariakit-utils/store";
import { SetState } from "ariakit-utils/types";

export function createDisclosureStore({
  open = false,
  animated = false,
}: DisclosureStoreProps = {}): DisclosureStore {
  const store = createStore<DisclosureStoreState>({
    open,
    animated,
    animating: animated && open,
    mounted: open,
    contentElement: null,
    disclosureElement: null,
  });

  const setup = () => {
    return chain(
      store.sync(
        (state) => store.setState("mounted", state.open || state.animating),
        ["open", "animating"]
      ),
      store.sync(
        (state, prevState) => {
          if (!state.animated) return;
          store.setState("animating", state.open !== prevState.open);
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

export type DisclosureStoreState = {
  open: boolean;
  mounted: boolean;
  animated: boolean;
  animating: boolean;
  contentElement: HTMLElement | null;
  disclosureElement: HTMLElement | null;
};

export type DisclosureStore = Store<DisclosureStoreState> & {
  setOpen: SetState<DisclosureStoreState["open"]>;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  stopAnimation: () => void;
  setContentElement: SetState<DisclosureStoreState["contentElement"]>;
  setDisclosureElement: SetState<DisclosureStoreState["disclosureElement"]>;
};

export type DisclosureStoreProps = Partial<
  Pick<DisclosureStoreState, "open" | "animated">
>;
