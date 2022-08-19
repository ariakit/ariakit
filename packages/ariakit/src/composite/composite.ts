import {
  FocusEvent,
  KeyboardEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flatten2DArray, reverseArray } from "ariakit-utils/array";
import { getActiveElement, isTextField } from "ariakit-utils/dom";
import {
  fireBlurEvent,
  fireFocusEvent,
  fireKeyboardEvent,
  isSelfTarget,
} from "ariakit-utils/events";
import { focusIntoView, hasFocus } from "ariakit-utils/focus";
import {
  useEvent,
  useForkRef,
  useLiveRef,
  useSafeLayoutEffect,
} from "ariakit-utils/hooks";
import { queueMicrotask } from "ariakit-utils/misc";
import { useStoreProvider } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Props } from "ariakit-utils/types";
import { FocusableOptions, useFocusable } from "../focusable/focusable";
import {
  CompositeContext,
  Item,
  findEnabledItemById,
  findFirstEnabledItem,
  groupItemsByRows,
  isItem,
  silentlyFocused,
} from "./__utils";
import { CompositeState } from "./composite-state";

function isGrid(items: Item[]) {
  return items.some((item) => !!item.rowId);
}

function isPrintableKey(event: ReactKeyboardEvent): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey;
}

function canProxyKeyboardEvent(
  event: ReactKeyboardEvent,
  state: CompositeState
) {
  if (!isSelfTarget(event)) return false;
  const target = event.target as Element;
  if (!target) return true;
  if (isTextField(target)) {
    // Printable characters shouldn't perform actions on the composite items if
    // the composite widget is a combobox.
    if (isPrintableKey(event)) return false;
    const grid = isGrid(state.items);
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
  state: CompositeState,
  activeItem?: Item,
  onKeyboardEvent?: KeyboardEventHandler,
  previousElementRef?: RefObject<HTMLElement | null>
) {
  return useEvent((event: ReactKeyboardEvent) => {
    onKeyboardEvent?.(event);
    if (event.defaultPrevented) return;
    const activeElement = activeItem?.ref.current;
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

function findFirstEnabledItemInTheLastRow(items: Item[]) {
  return findFirstEnabledItem(
    flatten2DArray(reverseArray(groupItemsByRows(items)))
  );
}

function useScheduleFocus(activeItem?: Item) {
  const [scheduled, setScheduled] = useState(false);
  const schedule = useCallback(() => setScheduled(true), []);
  useEffect(() => {
    const activeElement = activeItem?.ref.current;
    if (scheduled && activeElement) {
      setScheduled(false);
      focusIntoView(activeElement);
    }
  }, [activeItem, scheduled]);
  return schedule;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a composite widget.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const state = useCompositeState();
 * const props = useComposite({ state });
 * <Role {...props}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 * </Role>
 * ```
 */
export const useComposite = createHook<CompositeOptions>(
  ({ state, composite = true, focusOnMove = composite, ...props }) => {
    const ref = useRef<HTMLDivElement>(null);
    const virtualFocus = composite && state.virtualFocus;
    const activeItem = useMemo(
      () => findEnabledItemById(state.items, state.activeId),
      [state.items, state.activeId]
    );
    const activeItemRef = useLiveRef(activeItem);
    const previousElementRef = useRef<HTMLElement | null>(null);
    const isSelfActive = state.activeId === null;
    const isSelfAciveRef = useLiveRef(isSelfActive);
    const scheduleFocus = useScheduleFocus(activeItem);

    // Focus on the active item element.
    useSafeLayoutEffect(() => {
      if (!composite) return;
      if (!focusOnMove) return;
      if (!state.moves) return;
      const itemElement = activeItemRef.current?.ref.current;
      if (!itemElement) return;
      // We're scheduling the focus on the next tick to avoid the `onFocus`
      // event on each item to be triggered before the state changes can
      // propagate to them.
      scheduleFocus();
    }, [composite, focusOnMove, state.moves]);

    // If composite.move(null) has been called, the composite container (this
    // element) should receive focus.
    useSafeLayoutEffect(() => {
      if (!composite) return;
      if (!state.moves) return;
      if (!isSelfAciveRef.current) return;
      const element = ref.current;
      if (!element) return;
      const previousElement = previousElementRef.current;
      // We have to clean up the previous element ref so an additional blur
      // event is not fired on it, for example, when looping through items while
      // includesBaseElement is true.
      previousElementRef.current = null;
      if (previousElement) {
        // We fire a blur event on the previous active item before moving focus
        // to the composite element so the events are dispatched in the right
        // order (blur, then focus).
        fireBlurEvent(previousElement, { relatedTarget: element });
      }
      // If the composite element is already focused, we still need to fire a
      // focus event on it so consumer props like onFocus are called.
      if (hasFocus(element)) {
        fireFocusEvent(element, { relatedTarget: previousElement });
      } else {
        element.focus();
      }
    }, [composite, state.moves]);

    // At this point, if the activeId has changed and we still have a
    // previousElement, this means that the previousElement hasn't been blurred,
    // so we do it here. This will be the scenario when moving through items, in
    // which case the onFocusCapture below event will stop propgation.
    useSafeLayoutEffect(() => {
      if (!virtualFocus) return;
      if (!composite) return;
      const previousElement = previousElementRef.current;
      previousElementRef.current = null;
      if (!previousElement) return;
      const activeElement = activeItemRef.current?.ref.current;
      const relatedTarget = activeElement || getActiveElement(previousElement);
      fireBlurEvent(previousElement, { relatedTarget });
    }, [virtualFocus, composite, state.activeId]);

    const onKeyDownCapture = useKeyboardEventProxy(
      state,
      activeItem,
      props.onKeyDownCapture,
      previousElementRef
    );

    const onKeyUpCapture = useKeyboardEventProxy(
      state,
      activeItem,
      props.onKeyUpCapture,
      previousElementRef
    );

    const onFocusCaptureProp = props.onFocusCapture;

    const onFocusCapture = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onFocusCaptureProp?.(event);
      if (event.defaultPrevented) return;
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
      if (virtualFocus) {
        // This means that the composite element has been focused while the
        // composite item has not. For example, by clicking on the composite
        // element without touching any item, or by tabbing into the composite
        // element. In this case, we want to trigger focus on the item, just
        // like it would happen with roving tabindex. When it receives focus,
        // the composite item will move focus back to the composite element.
        if (isSelfTarget(event) && !isItem(state.items, event.relatedTarget)) {
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
        state.setActiveId(null);
      }
    });

    const onBlurCaptureProp = props.onBlurCapture;

    const onBlurCapture = useEvent((event: FocusEvent<HTMLDivElement>) => {
      onBlurCaptureProp?.(event);
      if (event.defaultPrevented) return;
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
      const activeElement = activeItem?.ref.current || null;
      const nextActiveElement = event.relatedTarget;
      const nextActiveElementIsItem = isItem(state.items, nextActiveElement);
      const previousElement = previousElementRef.current;
      previousElementRef.current = null;
      // This is an intermediate blur event: blurring the composite container
      // to focus on an item (nextActiveElement).
      if (isSelfTarget(event) && nextActiveElementIsItem) {
        // The next active element will be the same as the active item in the
        // state in these two scenarios:
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
        const targetIsItem = isItem(state.items, event.target);
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

    const onKeyDown = useEvent((event: ReactKeyboardEvent<HTMLDivElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (!isSelfTarget(event)) return;
      if (activeItemRef.current) return;
      const isVertical = state.orientation !== "horizontal";
      const isHorizontal = state.orientation !== "vertical";
      const grid = isGrid(state.items);
      const up = () => {
        if (grid) {
          const item =
            state.items && findFirstEnabledItemInTheLastRow(state.items);
          return item?.id;
        }
        return state.last();
      };
      const keyMap = {
        ArrowUp: (grid || isVertical) && up,
        ArrowRight: (grid || isHorizontal) && state.first,
        ArrowDown: (grid || isVertical) && state.first,
        ArrowLeft: (grid || isHorizontal) && state.last,
        Home: state.first,
        End: state.last,
        PageUp: state.first,
        PageDown: state.last,
      };
      const action = keyMap[event.key as keyof typeof keyMap];
      if (action) {
        const id = action();
        if (id !== undefined) {
          event.preventDefault();
          state.move(id);
        }
      }
    });

    props = useStoreProvider({ state, ...props }, CompositeContext);

    const activeId = activeItem?.id || undefined;

    props = {
      "aria-activedescendant": virtualFocus ? activeId : undefined,
      ...props,
      ref: useForkRef(ref, composite ? state.baseRef : undefined, props.ref),
      onKeyDownCapture,
      onKeyUpCapture,
      onFocusCapture,
      onFocus,
      onBlurCapture,
      onKeyDown,
    };

    const focusable = composite && (virtualFocus || state.activeId === null);

    props = useFocusable({ focusable, ...props });

    return props;
  }
);

/**
 * A component that renders a composite widget.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeState();
 * <Composite state={composite}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 * </Composite>
 * ```
 */
export const Composite = createComponent<CompositeOptions>((props) => {
  const htmlProps = useComposite(props);
  return createElement("div", htmlProps);
});

export type CompositeOptions<T extends As = "div"> = FocusableOptions<T> & {
  /**
   * Object returned by the `useCompositeState` hook.
   */
  state: CompositeState;
  /**
   * Whether the component should behave as a composite widget. This prop should
   * be set to `false` when combining different composite widgets where only one
   * should behave as such.
   * @default true
   * @example
   * ```jsx
   * // Combining two composite widgets (combobox and menu), where only the
   * // Combobox component should behave as a composite widget.
   * const combobox = useComboboxState();
   * const menu = useMenuState(combobox);
   * <MenuButton state={menu}>Open Menu</MenuButton>
   * <Menu state={menu} composite={false}>
   *   <Combobox state={combobox} />
   *   <ComboboxList state={combobox}>
   *     <ComboboxItem as={MenuItem}>Item 1</ComboboxItem>
   *     <ComboboxItem as={MenuItem}>Item 2</ComboboxItem>
   *     <ComboboxItem as={MenuItem}>Item 3</ComboboxItem>
   *   </ComboboxList>
   * </Menu>
   * ```
   */
  composite?: boolean;
  /**
   * Whether the active composite item should receive focus when
   * `composite.move` is called.
   * @default true
   */
  focusOnMove?: boolean;
};

export type CompositeProps<T extends As = "div"> = Props<CompositeOptions<T>>;
