import { defaultValue } from "../utils/misc";
import { Store, StoreOptions, StoreProps, createStore } from "../utils/store";
import { SetState } from "../utils/types";

export function createDisclosureStore(
  props: DisclosureStoreProps = {}
): DisclosureStore {
  const store = props.store?.omit("contentElement", "disclosureElement");
  const syncState = store?.getState();

  const open = defaultValue(
    props.open,
    syncState?.open,
    props.defaultOpen,
    false
  );

  const animated = defaultValue(props.animated, syncState?.animated, false);

  const initialState: DisclosureStoreState = {
    open,
    animated,
    animating: !!animated && open,
    mounted: open,
    contentElement: null,
    disclosureElement: null,
  };

  const disclosure = createStore(initialState, store);

  disclosure.setup(() =>
    disclosure.sync(
      (state) => {
        if (state.animated) return;
        // Reset animating to false when animation is disabled.
        disclosure.setState("animating", false);
      },
      ["animated", "animating"]
    )
  );

  disclosure.setup(() =>
    disclosure.sync(
      (state, prev) => {
        if (!state.animated) return;
        const mounting = state === prev;
        const animating = mounting ? state.open : state.open !== prev.open;
        disclosure.setState("animating", animating);
      },
      ["open", "animated"]
    )
  );

  disclosure.setup(() =>
    disclosure.sync(
      (state) => {
        disclosure.setState("mounted", state.open || state.animating);
      },
      ["open", "animating"]
    )
  );

  return {
    ...disclosure,
    setOpen: (value) => disclosure.setState("open", value),
    show: () => disclosure.setState("open", true),
    hide: () => disclosure.setState("open", false),
    toggle: () => disclosure.setState("open", (open) => !open),
    stopAnimation: () => disclosure.setState("animating", false),
    setContentElement: (value) => disclosure.setState("contentElement", value),
    setDisclosureElement: (value) =>
      disclosure.setState("disclosureElement", value),
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
> & {
  defaultOpen?: DisclosureStoreState["open"];
};

export type DisclosureStoreProps = DisclosureStoreOptions &
  StoreProps<DisclosureStoreState>;

export type DisclosureStore = DisclosureStoreFunctions &
  Store<DisclosureStoreState>;
