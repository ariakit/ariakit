import { defaultValue } from "../utils/misc.js";
import type { Store, StoreOptions, StoreProps } from "../utils/store.js";
import {
  createStore,
  mergeStore,
  omit,
  setup,
  subscribe,
  sync,
  throwOnConflictingProps,
} from "../utils/store.js";
import type { SetState } from "../utils/types.js";

/**
 * Creates a disclosure store.
 */
export function createDisclosureStore(
  props: DisclosureStoreProps = {},
): DisclosureStore {
  const store = mergeStore(
    props.store,
    omit(props.disclosure, ["contentElement", "disclosureElement"]),
  );

  throwOnConflictingProps(props, store);

  const syncState = store?.getState();

  const open = defaultValue(
    props.open,
    syncState?.open,
    props.defaultOpen,
    false,
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

  setup(disclosure, () =>
    sync(disclosure, ["animated", "animating"], (state) => {
      if (state.animated) return;
      // Reset animating to false when animation is disabled.
      disclosure.setState("animating", false);
    }),
  );

  setup(disclosure, () =>
    subscribe(disclosure, ["open"], () => {
      if (!disclosure.getState().animated) return;
      disclosure.setState("animating", true);
    }),
  );

  setup(disclosure, () =>
    sync(disclosure, ["open", "animating"], (state) => {
      disclosure.setState("mounted", state.open || state.animating);
    }),
  );

  return {
    ...disclosure,
    disclosure: props.disclosure,
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
   * Whether the content is visible.
   *
   * Live examples:
   * - [Combobox with links](https://ariakit.org/examples/combobox-links)
   * - [Dialog with React
   *   Router](https://ariakit.org/examples/dialog-react-router)
   * - [Menu with Framer
   *   Motion](https://ariakit.org/examples/menu-framer-motion)
   * - [Lazy Popover](https://ariakit.org/examples/popover-lazy)
   * @default false
   */
  open: boolean;
  /**
   * The mounted state usually matches the
   * [`open`](https://ariakit.org/reference/disclosure-provider#open) value.
   * However, if the content element is animated, it waits for the animation to
   * finish before turning `false`. This ensures the content element doesn't get
   * unmounted during the animation.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   * - [Responsive Popover](https://ariakit.org/examples/popover-responsive)
   */
  mounted: boolean;
  /**
   * Determines whether the content should animate when it is shown or hidden.
   * - If `true`, the `animating` state will be `true` when the content is shown
   *   or hidden and it will wait for a CSS animation/transition to end before
   *   becoming `false`.
   * - If it's set to a number, the `animating` state will be `true` when the
   *   content is shown or hidden and it will wait for the number of
   *   milliseconds to pass before becoming `false`.
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

export interface DisclosureStoreFunctions
  extends Pick<DisclosureStoreOptions, "disclosure"> {
  /**
   * Sets the [`open`](https://ariakit.org/reference/disclosure-provider#open)
   * state.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * @example
   * store.setOpen(true);
   * store.setOpen((open) => !open);
   */
  setOpen: SetState<DisclosureStoreState["open"]>;
  /**
   * Sets the [`open`](https://ariakit.org/reference/disclosure-provider#open)
   * state to `true`.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * - [Dialog with Framer
   *   Motion](https://ariakit.org/examples/dialog-framer-motion)
   * - [Context Menu](https://ariakit.org/examples/menu-context-menu)
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   */
  show: () => void;
  /**
   * Sets the [`open`](https://ariakit.org/reference/disclosure-provider#open)
   * state to `false`.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
   */
  hide: () => void;
  /**
   * Toggles the
   * [`open`](https://ariakit.org/reference/disclosure-provider#open) state.
   */
  toggle: () => void;
  /**
   * Sets the `animating` state to `false`, which will automatically set the
   * `mounted` state to `false` if it was `true`. This means that the content
   * element can be safely unmounted.
   * @deprecated Use `setState("animating", false)` instead.
   */
  stopAnimation: () => void;
  /**
   * Sets the `contentElement` state.
   */
  setContentElement: SetState<DisclosureStoreState["contentElement"]>;
  /**
   * Sets the `disclosureElement` state.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   */
  setDisclosureElement: SetState<DisclosureStoreState["disclosureElement"]>;
}

export interface DisclosureStoreOptions
  extends StoreOptions<DisclosureStoreState, "open" | "animated"> {
  /**
   * @deprecated Manually setting the `animated` prop is no longer necessary.
   * This will be removed in a future release.
   */
  animated?: DisclosureStoreState["animated"];
  /**
   * Whether the content should be visible by default.
   * @default false
   */
  defaultOpen?: DisclosureStoreState["open"];
  /**
   * A reference to another disclosure store that controls another disclosure
   * component to keep them in sync. Element states like `contentElement` and
   * `disclosureElement` won't be synced. For that, use the
   * [`store`](https://ariakit.org/reference/disclosure-provider#store) prop
   * instead.
   */
  disclosure?: DisclosureStore | null;
}

export interface DisclosureStoreProps
  extends DisclosureStoreOptions,
    StoreProps<DisclosureStoreState> {}

export interface DisclosureStore
  extends DisclosureStoreFunctions,
    Store<DisclosureStoreState> {}
