import type {
  FocusEvent,
  KeyboardEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { flatten2DArray, reverseArray } from "@ariakit/core/utils/array";
import { getActiveElement, isTextField } from "@ariakit/core/utils/dom";
import {
  fireBlurEvent,
  fireFocusEvent,
  fireKeyboardEvent,
  isSelfTarget,
} from "@ariakit/core/utils/events";
import { focusIntoView, hasFocus } from "@ariakit/core/utils/focus";
import { invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { FocusableOptions } from "../focusable/focusable.js";
import { useFocusable } from "../focusable/focusable.js";
import {
  useBooleanEvent,
  useEvent,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
} from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import {
  CompositeContextProvider,
  useCompositeProviderContext,
} from "./composite-context.js";
import type {
  CompositeStore,
  CompositeStoreItem,
  CompositeStoreState,
} from "./composite-store.js";
import {
  findFirstEnabledItem,
  getEnabledItem,
  groupItemsByRows,
  isItem,
  silentlyFocused,
} from "./utils.js";

function isGrid(items: CompositeStoreItem[]) {
  return items.some((item) => !!item.rowId);
}

function isPrintableKey(event: ReactKeyboardEvent): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey;
}

function isModifierKey(event: ReactKeyboardEvent) {
  return (
    event.key === "Shift" ||
    event.key === "Control" ||
    event.key === "Alt" ||
    event.key === "Meta"
  );
}

function canProxyKeyboardEvent(
  event: ReactKeyboardEvent,
  state: CompositeStoreState,
) {
  if (!isSelfTarget(event)) return false;
  if (isModifierKey(event)) return false;
  const target = event.target as Element;
  if (!target) return true;
  if (isTextField(target)) {
    // Printable characters shouldn't perform actions on the composite items if
    // the composite widget is a combobox.
    if (isPrintableKey(event)) return false;
    const grid = isGrid(state.renderedItems);
    const focusingInputOnly = state.activeId === null;
    // Pressing Home or End keys on the text field should only be allowed when
    // the widget has rows and the input is not the only element with focus.
    // That is, the aria-activedescendant has no value.
    const allowHorizontalNavigationOnItems = grid && !focusingInputOnly;
    const isHomeOrEnd = event.key === "Home" || event.key === "End";
    // If there are no rows or the input is the only focused element, then we
    // should stop the event propagation so no action is performed on the
    // composite items, but only on the input, like moving the caret/selection.
    if (!allowHorizontalNavigationOnItems && isHomeOrEnd) return false;
  }
  return !event.isPropagationStopped();
}

function useKeyboardEventProxy(
  store: CompositeStore,
  onKeyboardEvent?: KeyboardEventHandler,
  previousElementRef?: RefObject<HTMLElement | null>,
) {
  return useEvent((event: ReactKeyboardEvent) => {
    onKeyboardEvent?.(event);
    if (event.defaultPrevented) return;
    const state = store.getState();
    const activeElement = getEnabledItem(store, state.activeId)?.element;
    if (!activeElement) return;
    if (!canProxyKeyboardEvent(event, state)) return;
    const { view, ...eventInit } = event;
    const previousElement = previousElementRef?.current;
    // If the active item element is not the previous element, this means that
    // it hasn't been focused (for example, when using composite hover). So we
    // focus on it before firing the keyboard event.
    if (activeElement !== previousElement) {
      activeElement.focus();
    }
    if (!fireKeyboardEvent(activeElement, event.type, eventInit)) {
      event.preventDefault();
    }
    // The event will be triggered on the composite item and then propagated up
    // to this composite element again, so we can pretend that it wasn't called
    // on this component in the first place.
    if (event.currentTarget.contains(activeElement)) {
      event.stopPropagation();
    }
  });
}

function findFirstEnabledItemInTheLastRow(items: CompositeStoreItem[]) {
  return findFirstEnabledItem(
    flatten2DArray(reverseArray(groupItemsByRows(items))),
  );
}

function useScheduleFocus(store: CompositeStore) {
  const [scheduled, setScheduled] = useState(false);
  const schedule = useCallback(() => setScheduled(true), []);
  const activeItem = store.useState((state) =>
    getEnabledItem(store, state.activeId),
  );
  useEffect(() => {
    const activeElement = activeItem?.element;
    if (!scheduled) return;
    if (!activeElement) return;
    setScheduled(false);
    activeElement.focus({ preventScroll: true });
  }, [activeItem, scheduled]);
  return schedule;
}

/**
 * Returns props to create a `Composite` component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useComposite({ store });
 * <Role {...props}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 * </Role>
 * ```
 */
export const useComposite = createHook<CompositeOptions>(
  ({
    store,
    composite = true,
    focusOnMove = composite,
    moveOnKeyPress = true,
    ...props
  }) => {
    const context = useCompositeProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "Composite must receive a `store` prop or be wrapped in a CompositeProvider component.",
    );

    const previousElementRef = useRef<HTMLElement | null>(null);
    const scheduleFocus = useScheduleFocus(store);
    const moves = store.useState("moves");

    // Focus on the active item element.
    useEffect(() => {
      if (!store) return;
      if (!moves) return;
      if (!composite) return;
      if (!focusOnMove) return;
      const { activeId } = store.getState();
      const itemElement = getEnabledItem(store, activeId)?.element;
      if (!itemElement) return;
      focusIntoView(itemElement);
    }, [store, moves, composite, focusOnMove]);

    // If composite.move(null) has been called, the composite container (this
    // element) should receive focus.
    useSafeLayoutEffect(() => {
      if (!store) return;
      if (!moves) return;
      if (!composite) return;
      const { baseElement, activeId } = store.getState();
      const isSelfAcive = activeId === null;
      if (!isSelfAcive) return;
      if (!baseElement) return;
      const previousElement = previousElementRef.current;
      // We have to clean up the previous element ref so an additional blur
      // event is not fired on it, for example, when looping through items while
      // includesBaseElement is true.
      previousElementRef.current = null;
      if (previousElement) {
        // We fire a blur event on the previous active item before moving focus
        // to the composite element so the events are dispatched in the right
        // order (blur, then focus).
        fireBlurEvent(previousElement, { relatedTarget: baseElement });
      }
      // If the composite element is already focused, we still need to fire a
      // focus event on it so consumer props like onFocus are called.
      if (hasFocus(baseElement)) {
        fireFocusEvent(baseElement, { relatedTarget: previousElement });
      } else {
        baseElement.focus();
      }
    }, [store, moves, composite]);

    // TODO: Refactor
    const activeId = store.useState("activeId");
    const virtualFocus = store.useState("virtualFocus");

    // At this point, if the activeId has changed and we still have a
    // previousElement, this means that the previousElement hasn't been blurred,
    // so we do it here. This will be the scenario when moving through items, in
    // which case the onFocusCapture below event will stop propgation.
    useSafeLayoutEffect(() => {
      if (!store) return;
      if (!composite) return;
      if (!virtualFocus) return;
      const previousElement = previousElementRef.current;
      previousElementRef.current = null;
      if (!previousElement) return;
      const activeElement = getEnabledItem(store, activeId)?.element;
      const relatedTarget = activeElement || getActiveElement(previousElement);
      fireBlurEvent(previousElement, { relatedTarget });
    }, [store, activeId, virtualFocus, composite]);

    const onKeyDownCapture = useKeyboardEventProxy(
      store,
      props.onKeyDownCapture,
      previousElementRef,
    );

    const onKeyUpCapture = useKeyboardEventProxy(
      store,
      props.onKeyUpCapture,
      previousElementRef,
    );

    const onFocusCaptureProp = props.onFocusCapture;

    const onFocusCapture = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusCaptureProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      const { virtualFocus } = store.getState();
      if (!virtualFocus) return;
      const previousActiveElement = event.relatedTarget as HTMLElement | null;
      const isSilentlyFocused = silentlyFocused(event.currentTarget);
      if (isSelfTarget(event) && isSilentlyFocused) {
        // Composite has been focused as a result of an item receiving focus.
        // The composite item will move focus back to the composite container.
        // In this case, we don't want to propagate this additional event nor
        // call the onFocus handler passed to <Composite onFocus={...} />.
        event.stopPropagation();
        // We keep track of the previous active item element so we can manually
        // fire a blur event on it later when the focus is moved to another item
        // on the onBlurCapture event below.
        previousElementRef.current = previousActiveElement;
      }
    });

    const onFocusProp = props.onFocus;

    const onFocus = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      if (!composite) return;
      if (!store) return;
      const { relatedTarget } = event;
      const { virtualFocus } = store.getState();
      if (virtualFocus) {
        // This means that the composite element has been focused while the
        // composite item has not. For example, by clicking on the composite
        // element without touching any item, or by tabbing into the composite
        // element. In this case, we want to trigger focus on the item, just
        // like it would happen with roving tabindex. When it receives focus,
        // the composite item will move focus back to the composite element.
        if (isSelfTarget(event) && !isItem(store, relatedTarget)) {
          // By queueing a microtask, we ensure the scheduleFocus effect will be
          // triggered after all the other effects that might have changed the
          // active item. This also accounts for when the composite container is
          // focused right after it gets mounted (for example, in a dialog), in
          // which case state.items will not be populated yet.
          queueMicrotask(scheduleFocus);
        }
      } else if (isSelfTarget(event)) {
        // When the roving tabindex composite gets intentionally focused (for
        // example, by clicking directly on it, and not on an item), we make
        // sure to set the activeId to null (which means the composite element
        // itself has focus).
        store.setActiveId(null);
      }
    });

    const onBlurCaptureProp = props.onBlurCapture;

    const onBlurCapture = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onBlurCaptureProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      const { virtualFocus, activeId } = store.getState();
      if (!virtualFocus) return;
      // When virtualFocus is set to true, we move focus from the composite
      // container (this element) to the composite item that is being selected.
      // Then we move focus back to the composite container. This is so we can
      // provide the same API as the roving tabindex method, which means people
      // can attach onFocus/onBlur handlers on the CompositeItem component
      // regardless of whether virtualFocus is set to true or false. This
      // sequence of blurring and focusing on items and on the composite element
      // may be confusing, so we ignore intermediate focus and blur events by
      // stopping their propagation.
      const activeElement = getEnabledItem(store, activeId)?.element;
      const nextActiveElement = event.relatedTarget;
      const nextActiveElementIsItem = isItem(store, nextActiveElement);
      const previousElement = previousElementRef.current;
      previousElementRef.current = null;
      // This is an intermediate blur event: blurring the composite container
      // to focus on an item (nextActiveElement).
      if (isSelfTarget(event) && nextActiveElementIsItem) {
        // The next active element will be the same as the active item in the
        // store in these two scenarios:
        //   - Moving focus with keyboard: the state is updated before the blur
        //     event is triggered, so here the active item is already pointing
        //     to the next active element.
        //   - Clicking on the active item with a pointer: this will trigger
        //     blur on the composite element and then the next active element
        //     will be the same as the active item. Clicking on an item other
        //     than the active one doesn't end up here as the activeItem state
        //     will be updated only after that.
        if (nextActiveElement === activeElement) {
          // If there's a previous active item and it's not a click action, then
          // we fire a blur event on it so it will work just like if it had DOM
          // focus before (like when using roving tabindex).
          if (previousElement && previousElement !== nextActiveElement) {
            fireBlurEvent(previousElement, event);
          }
        }
        // This will be true when the next active element is not the active
        // element, but there's an active item. This will only happen when
        // clicking with a pointer on a different item, when there's already an
        // item selected, in which case activeElement is the item that is
        // getting blurred, and nextActiveElement is the item that is being
        // clicked.
        else if (activeElement) {
          fireBlurEvent(activeElement, event);
        }
        // We want to ignore intermediate blur events, so we stop the
        // propagation of this event.
        event.stopPropagation();
      } else {
        const targetIsItem = isItem(store, event.target);
        // If target is not a composite item, it may be the composite element
        // itself (isSelfTarget) or a tabbable element inside the composite
        // element. This may be triggered by clicking outside of the composite
        // element or by tabbing out of it. In either cases, we want to fire a
        // blur event on the active item.
        if (!targetIsItem && activeElement) {
          fireBlurEvent(activeElement, event);
        }
      }
    });

    const onKeyDownProp = props.onKeyDown;
    const moveOnKeyPressProp = useBooleanEvent(moveOnKeyPress);

    const onKeyDown = useEvent((event: ReactKeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (!store) return;
      if (!isSelfTarget(event)) return;
      const { orientation, items, renderedItems, activeId } = store.getState();
      const activeItem = getEnabledItem(store, activeId);
      if (activeItem?.element?.isConnected) return;
      const isVertical = orientation !== "horizontal";
      const isHorizontal = orientation !== "vertical";
      const grid = isGrid(renderedItems);
      // TODO: Refactor and explain
      if (isTextField(event.currentTarget)) {
        const focusingInputOnly = activeId === null;
        const allowHorizontalNavigationOnItems = grid && !focusingInputOnly;
        const isHorizontalNavigation =
          event.key === "ArrowLeft" ||
          event.key === "ArrowRight" ||
          event.key === "Home" ||
          event.key === "End";
        if (!allowHorizontalNavigationOnItems && isHorizontalNavigation) {
          return;
        }
      }
      const up = () => {
        if (grid) {
          const item = items && findFirstEnabledItemInTheLastRow(items);
          return item?.id;
        }
        return store?.last();
      };
      const keyMap = {
        ArrowUp: (grid || isVertical) && up,
        ArrowRight: (grid || isHorizontal) && store.first,
        ArrowDown: (grid || isVertical) && store.first,
        ArrowLeft: (grid || isHorizontal) && store.last,
        Home: store.first,
        End: store.last,
        PageUp: store.first,
        PageDown: store.last,
      };
      const action = keyMap[event.key as keyof typeof keyMap];
      if (action) {
        const id = action();
        if (id !== undefined) {
          if (!moveOnKeyPressProp(event)) return;
          event.preventDefault();
          store.move(id);
        }
      }
    });

    props = useWrapElement(
      props,
      (element) => (
        <CompositeContextProvider value={store}>
          {element}
        </CompositeContextProvider>
      ),
      [store],
    );

    const activeDescendant = store.useState((state) => {
      if (!store) return;
      if (!composite) return;
      if (!state.virtualFocus) return;
      return getEnabledItem(store, state.activeId)?.id;
    });

    props = {
      "aria-activedescendant": activeDescendant,
      ...props,
      ref: useMergeRefs(composite ? store.setBaseElement : null, props.ref),
      onKeyDownCapture,
      onKeyUpCapture,
      onFocusCapture,
      onFocus,
      onBlurCapture,
      onKeyDown,
    };

    const focusable = store.useState(
      (state) => composite && (state.virtualFocus || state.activeId === null),
    );

    props = useFocusable({ focusable, ...props });

    return props;
  },
);

/**
 * Renders a composite widget.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 * <Composite store={composite}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 * </Composite>
 * ```
 */
export const Composite = createComponent<CompositeOptions>((props) => {
  const htmlProps = useComposite(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Composite.displayName = "Composite";
}

export interface CompositeOptions<T extends As = "div">
  extends FocusableOptions<T> {
  /**
   * Object returned by the `useCompositeStore` hook.
   */
  store?: CompositeStore;
  /**
   * Whether the component should behave as a composite widget. This prop should
   * be set to `false` when combining different composite widgets where only one
   * should behave as such.
   * @default true
   */
  composite?: boolean;
  /**
   * Whether the active composite item should receive focus when `store.move` is
   * called.
   * @default true
   */
  focusOnMove?: boolean;
  /**
   * Whether the composite widget should move focus to an item when pressing
   * arrow keys.
   * @default true
   */
  moveOnKeyPress?: BooleanOrCallback<ReactKeyboardEvent<HTMLElement>>;
}

export type CompositeProps<T extends As = "div"> = Props<CompositeOptions<T>>;
