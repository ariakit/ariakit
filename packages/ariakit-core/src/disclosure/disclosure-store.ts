import { defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import { createStore, mergeStore } from "../utils/store.js";
import type { SetState } from "../utils/types.js";

/**
 * Creates a disclosure store.
 */
export function createDisclosureStore(
  props: DisclosureStoreProps = {}
): DisclosureStore {
  const store = mergeStore(
    props.store,
    props.disclosure?.omit("contentElement", "disclosureElement")
  );

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
    contentElement: defaultValue(syncState?.contentElement, null),
    disclosureElement: defaultValue(syncState?.disclosureElement, null),
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

export interface DisclosureStoreState {
  /**
   * The visibility state of the content.
   *
   * Live examples:
   * - [Dialog with React
   *   Router](https://ariakit.org/examples/dialog-react-router)
   * @default false
   */
  open: boolean;
  /**
   * The mounted state of the content. If `animated` is `false` or not defined,
   * this will be the same as `open`. Otherwise, it will wait for the animation
   * to complete before becoming `false` so the content is not unmounted while
   * animating.
   *
   * Live examples:
   * - [Combobox with links](https://ariakit.org/examples/combobox-links)
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   */
  mounted: boolean;
  /**
   * Determines whether the content should animate when it is shown or hidden.
   * - If `true`, the `animating` state will be `true` when the content is shown
   *   or hidden and it will wait for `stopAnimation` to be called or a CSS
   *   animation/transition to end before becoming `false`.
   * - If it's set to a number, the `animating` state will be `true` when the
   *   content is shown or hidden and it will wait for the number of
   *   milliseconds to pass before becoming `false`.
   *
   * Live examples:
   * - [Animated Combobox](https://ariakit.org/examples/combobox-animated)
   * - [Animated Dialog](https://ariakit.org/examples/dialog-animated)
   * - [Animated Select](https://ariakit.org/examples/select-animated)
   * @default false
   */
  animated: boolean | number;
  /**
   * Whether the content is currently animating.
   */
  animating: boolean;
  /**
   * The content element that is being shown or hidden.
   */
  contentElement: HTMLElement | null;
  /**
   * The disclosure button element that toggles the content.
   */
  disclosureElement: HTMLElement | null;
}

export interface DisclosureStoreFunctions {
  /**
   * Sets the `open` state.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * - [Dialog with React
   *   Router](https://ariakit.org/examples/dialog-react-router)
   * @example
   * store.setOpen(true);
   * store.setOpen((open) => !open);
   */
  setOpen: SetState<DisclosureStoreState["open"]>;
  /**
   * Sets the `open` state to `true`.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   */
  show: () => void;
  /**
   * Sets the `open` state to `false`.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * - [Dialog with React
   *   Router](https://ariakit.org/examples/dialog-react-router)
   */
  hide: () => void;
  /**
   * Toggles the `open` state.
   */
  toggle: () => void;
  /**
   * Sets the `animating` state to `false`, which will automatically set the
   * `mounted` state to `false` if it was `true`. This means that the content
   * element can be safely unmounted.
   */
  stopAnimation: () => void;
  /**
   * Sets the `contentElement` state.
   */
  setContentElement: SetState<DisclosureStoreState["contentElement"]>;
  /**
   * Sets the `disclosureElement` state.
   */
  setDisclosureElement: SetState<DisclosureStoreState["disclosureElement"]>;
}

export interface DisclosureStoreOptions
  extends StoreOptions<DisclosureStoreState, "open" | "animated"> {
  /**
   * The default visibility state of the content.
   * @default false
   */
  defaultOpen?: DisclosureStoreState["open"];
  /**
   * A reference to another disclosure store that controls another disclosure
   * component to keep them in sync. Element states like `contentElement` and
   * `disclosureElement` won't be synced. For that, use the `store` prop
   * instead.
   */
  disclosure?: DisclosureStore;
}

export type DisclosureStoreProps = DisclosureStoreOptions &
  StoreProps<DisclosureStoreState>;

export type DisclosureStore = DisclosureStoreFunctions &
  Store<DisclosureStoreState>;
