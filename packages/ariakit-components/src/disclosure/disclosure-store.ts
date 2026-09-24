import {
  createStore,
  mergeStore,
  omit,
  setup,
  subscribe,
  sync,
  throwOnConflictingProps,
} from "@ariakit/store";
import type { Store, StoreOptions, StoreProps } from "@ariakit/store";
import { applyState, defaultValue } from "@ariakit/utils";
import type { SetState } from "@ariakit/utils";
import { getHideRequest } from "./__hide-request.ts";

type OnHideRequest = DisclosureStoreFunctions["unstable_onHideRequest"];
type RequestHide = DisclosureStoreFunctions["unstable_requestHide"];
type HideHandler = Parameters<OnHideRequest>[0];

/**
 * Creates a disclosure store.
 */
export function createDisclosureStore(
  props: DisclosureStoreProps = {},
): DisclosureStore {
  const store =
    props.store || props.disclosure
      ? mergeStore(
          props.store,
          omit(props.disclosure, ["contentElement", "disclosureElement"]),
        )
      : undefined;

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

  // Omit an undefined parent so createStore keeps its zero-parent fast path.
  const disclosure = store
    ? createStore(initialState, store)
    : createStore(initialState);

  // Clear the animation state when animation is disabled.
  setup(disclosure, () =>
    sync(disclosure, ["animated", "animating"], (state) => {
      if (state.animated) return;
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

  // Stores connected through the store option share the open state, so they
  // also share the hide handlers, which the topmost store keeps. A request on
  // any of them, such as a combobox item hiding the combobox store, reaches the
  // handler of a Dialog that extends another one. A store linked through the
  // disclosure option shares the open state too, so it shares its handlers.
  // https://github.com/ariakit/ariakit/issues/7621
  const parentHideRequest =
    getHideRequest(props.store) ?? getHideRequest(props.disclosure);
  const hideHandlers = new Set<HideHandler>();

  const onHideRequest: OnHideRequest =
    parentHideRequest?.onHideRequest ??
    ((handler) => {
      hideHandlers.add(handler);
      return () => {
        hideHandlers.delete(handler);
      };
    });

  const requestHide: RequestHide =
    parentHideRequest?.requestHide ??
    ((hide) => {
      // Each handler receives a function that runs the next handler, and the
      // last one hides. A handler that doesn't call it keeps the content open,
      // so the open state doesn't change at all.
      const handlers = [...hideHandlers];
      const runHandler = (index: number) => {
        const handler = handlers[index];
        if (!handler) {
          hide();
          return;
        }
        handler(() => runHandler(index + 1));
      };
      runHandler(0);
    });

  const setOpen: DisclosureStoreFunctions["setOpen"] = (value) => {
    const { open } = disclosure.getState();
    const nextOpen = applyState(value, open);
    if (!open || nextOpen) {
      disclosure.setState("open", nextOpen);
      return;
    }
    requestHide(() => disclosure.setState("open", false));
  };

  return {
    ...disclosure,
    disclosure: props.disclosure,
    setOpen,
    show: () => disclosure.setState("open", true),
    hide: () => setOpen(false),
    toggle: () => setOpen((open) => !open),
    unstable_onHideRequest: onHideRequest,
    unstable_requestHide: requestHide,
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
   * - [Combobox with links](https://ariakit.com/examples/combobox-links)
   * - [Dialog with React
   *   Router](https://ariakit.com/examples/dialog-react-router)
   * - [Menu with
   *   Motion](https://ariakit.com/examples/menu-framer-motion)
   * - [Lazy Popover](https://ariakit.com/examples/popover-lazy)
   * @default false
   */
  open: boolean;
  /**
   * The mounted state usually matches the
   * [`open`](https://ariakit.com/reference/disclosure-provider#open) value.
   * However, if the content element is animated, it waits for the animation to
   * finish before turning `false`. This ensures the content element doesn't get
   * unmounted during the animation.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.com/examples/menubar-navigation)
   * - [Responsive Popover](https://ariakit.com/examples/popover-responsive)
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

export interface DisclosureStoreFunctions extends Pick<
  DisclosureStoreOptions,
  "disclosure"
> {
  /**
   * Sets the [`open`](https://ariakit.com/reference/disclosure-provider#open)
   * state.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * @example
   * store.setOpen(true);
   * store.setOpen((open) => !open);
   */
  setOpen: SetState<DisclosureStoreState["open"]>;
  /**
   * Sets the [`open`](https://ariakit.com/reference/disclosure-provider#open)
   * state to `true`.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * - [Dialog with
   *   Motion](https://ariakit.com/examples/dialog-framer-motion)
   * - [Context Menu](https://ariakit.com/examples/menu-context-menu)
   * - [Navigation Menubar](https://ariakit.com/examples/menubar-navigation)
   */
  show: () => void;
  /**
   * Sets the [`open`](https://ariakit.com/reference/disclosure-provider#open)
   * state to `false`.
   *
   * Live examples:
   * - [Textarea with inline
   *   Combobox](https://ariakit.com/examples/combobox-textarea)
   * - [Sliding Menu](https://ariakit.com/examples/menu-slide)
   */
  hide: () => void;
  /**
   * Toggles the
   * [`open`](https://ariakit.com/reference/disclosure-provider#open) state.
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
   * When showing the content programmatically, set this to the element that
   * should act as its trigger.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.com/examples/menubar-navigation)
   * @example
   * store.setDisclosureElement(triggerRef.current);
   * store.show();
   */
  setDisclosureElement: SetState<DisclosureStoreState["disclosureElement"]>;
  /**
   * Registers a handler that runs when `hide`, `toggle`, or `setOpen` would set
   * the `open` state to `false` on this store or on any store connected to it
   * through the `store` option, or linked to it through the `disclosure`,
   * `popover`, or `combobox` options. The handler receives a `hide` function.
   * Calling it synchronously, at most once, lets the request continue, and
   * returning without calling it keeps the content open. Returns a function
   * that unregisters the handler.
   * @deprecated
   * @private
   */
  unstable_onHideRequest: (handler: (hide: () => void) => void) => () => void;
  /**
   * Runs the hide handlers registered on the stores connected through the
   * `store` option, or linked through the `disclosure`, `popover`, or
   * `combobox` options, and calls `hide` when every handler lets the request
   * continue.
   * @deprecated
   * @private
   */
  unstable_requestHide: (hide: () => void) => void;
}

export interface DisclosureStoreOptions extends StoreOptions<
  DisclosureStoreState,
  "open" | "animated"
> {
  /**
   * @deprecated Manually setting the `animated` prop is no longer necessary.
   *   This will be removed in a future release.
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
   * [`store`](https://ariakit.com/reference/disclosure-provider#store) prop
   * instead.
   */
  disclosure?: DisclosureStore | null;
}

export interface DisclosureStoreProps
  extends DisclosureStoreOptions, StoreProps<DisclosureStoreState> {}

export interface DisclosureStore
  extends DisclosureStoreFunctions, Store<DisclosureStoreState> {}
