import {
  FocusEvent,
  KeyboardEvent,
  RefObject,
  SyntheticEvent,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { getScrollingElement, isButton, isTextField } from "ariakit-utils/dom";
import { isPortalEvent, isSelfTarget } from "ariakit-utils/events";
import {
  useBooleanEventCallback,
  useEventCallback,
  useForkRef,
  useId,
  useSafeLayoutEffect,
  useWrapElement,
} from "ariakit-utils/hooks";
import { isSafari } from "ariakit-utils/platform";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, BooleanOrCallback, Props } from "ariakit-utils/types";
import {
  CollectionItemOptions,
  useCollectionItem,
} from "../collection/collection-item";
import { CommandOptions, useCommand } from "../command/command";
import {
  CompositeContext,
  CompositeItemContext,
  CompositeRowContext,
  Item,
  findEnabledItemById,
  getContextId,
} from "./__utils";
import { CompositeState } from "./composite-state";

function isEditableElement(element: HTMLElement) {
  if (element.isContentEditable) return true;
  if (isTextField(element)) return true;
  return element.tagName === "INPUT" && !isButton(element);
}

function getNextPageOffset(scrollingElement: Element, pageUp = false) {
  const height = scrollingElement.clientHeight;
  const { top } = scrollingElement.getBoundingClientRect();
  // Calculates the size of the page based on the scrolling element's height.
  // This is similar to how browsers calculate the scroll position when pressing
  // spacebar, page up, or page down.
  const pageSize = Math.max(height * 0.875, height - 40) * 1.5;
  const pageOffset = pageUp ? height - pageSize + top : pageSize + top;
  if (scrollingElement.tagName === "HTML") {
    return pageOffset + scrollingElement.scrollTop;
  }
  return pageOffset;
}

function getItemOffset(itemElement: Element, pageUp = false) {
  const { top } = itemElement.getBoundingClientRect();
  if (pageUp) {
    // PageUp is always the inverse of PageDown. On PageDown, we consider only
    // the top offset of the element. On PageUp we need to add the height of the
    // element as well so we consider the bottom of it.
    return top + itemElement.clientHeight;
  }
  return top;
}

function findNextPageItemId(
  element: Element,
  items?: CompositeState["items"],
  next?: CompositeState["next"],
  pageUp = false
) {
  if (!items) return;
  if (!next) return;
  const scrollingElement = getScrollingElement(element);
  if (!scrollingElement) return;
  const nextPageOffset = getNextPageOffset(scrollingElement, pageUp);
  let id: string | null | undefined;
  let prevDifference: number | undefined;
  // We need to loop through the next items to find the one that is closest to
  // the next page offset.
  for (let i = 0; i < items.length; i += 1) {
    const previousId = id;
    id = next(i);
    if (!id) break;
    if (id === previousId) continue;
    const item = findEnabledItemById(items, id);
    const itemElement = item?.ref.current;
    if (!itemElement) continue;
    const itemOffset = getItemOffset(itemElement, pageUp);
    const difference = itemOffset - nextPageOffset;
    const absDifference = Math.abs(difference);
    // On PageUp, the element is at the next page if the difference between its
    // top offset (plus its height) and the next page offset is less than or
    // equal zero. On PageDown, the difference should be greater than or equal
    // zero.
    if ((pageUp && difference <= 0) || (!pageUp && difference >= 0)) {
      // There may be cases when there's a lot of space between the pages, for
      // example, when there's a lot of disabled items. In this case, the first
      // item in the next page might not be the closest one. So we return the
      // previous item id if its difference is less than the current one.
      if (prevDifference !== undefined && prevDifference < absDifference) {
        id = previousId;
      }
      break;
    }
    prevDifference = absDifference;
  }
  return id;
}

function useItem(items?: Item[], id?: string) {
  return useMemo(() => {
    if (!id) return;
    return items?.find((item) => item.id === id);
  }, [items, id]);
}

function targetIsAnotherItem(event: SyntheticEvent, items: Item[]) {
  if (isSelfTarget(event)) return false;
  const target = event.target as HTMLElement;
  const { compositeItemId } = target.dataset;
  for (const item of items) {
    if (item.ref.current === event.currentTarget) continue;
    if (item.ref.current === target || compositeItemId === item.id) {
      return true;
    }
  }
  return false;
}

function useRole(ref: RefObject<HTMLElement>, props: CompositeItemProps) {
  const [role, setRole] = useState(props.role);

  useSafeLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setRole(element.getAttribute("role") || props.role);
  }, [props.role]);

  return role;
}

function requiresAriaSelected(role?: string) {
  return role === "option" || role === "treeitem";
}

function supportsAriaSelected(role?: string) {
  if (role === "option") return true;
  if (role === "tab") return true;
  if (role === "treeitem") return true;
  if (role === "gridcell") return true;
  if (role === "row") return true;
  if (role === "columnheader") return true;
  if (role === "rowheader") return true;
  return false;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a composite item.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const state = useCompositeState();
 * const props = useCompositeItem({ state });
 * <Role {...props}>Item 1</Role>
 * ```
 */
export const useCompositeItem = createHook<CompositeItemOptions>(
  ({
    state,
    rowId: rowIdProp,
    preventScrollOnKeyDown = false,
    getItem: getItemProp,
    ...props
  }) => {
    const id = useId(props.id);
    state = useStore(state || CompositeContext, [
      useCallback((s: CompositeState) => s.activeId === id, [id]),
      "baseRef",
      "items",
      "virtualFocus",
      "registerItem",
      "setActiveId",
      "orientation",
      "up",
      "next",
      "down",
      "previous",
      "first",
      "last",
      "move",
    ]);

    const ref = useRef<HTMLButtonElement>(null);
    const row = useContext(CompositeRowContext);
    const rowId = rowIdProp ?? getContextId(state, row);
    const trulyDisabled = props.disabled && !props.accessibleWhenDisabled;

    const getItem = useCallback(
      (item) => {
        const nextItem = { ...item, id, rowId, disabled: !!trulyDisabled };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, rowId, trulyDisabled, getItemProp]
    );

    const onFocusProp = useEventCallback(props.onFocus);
    const hasFocusedComposite = useRef(false);

    const onFocus = useCallback(
      (event: FocusEvent<HTMLButtonElement>) => {
        onFocusProp(event);
        if (event.defaultPrevented) return;
        if (isPortalEvent(event)) return;
        if (!id) return;
        // If the target is another item, this probably means that composite
        // items are nested. This is okay when building, for example, tree or
        // treegrid elements. In this case, we just ignore the focus event on
        // this parent item.
        if (state?.items && targetIsAnotherItem(event, state.items)) return;
        state?.setActiveId(id);
        // When using aria-activedescendant, we want to make sure that the
        // composite container receives focus, not the composite item.
        if (!state?.virtualFocus) return;
        // But we'll only do this if the focused element is the composite item
        // itself
        if (!isSelfTarget(event)) return;
        // and the composite item is not a text field or contenteditable
        // element.
        if (isEditableElement(event.currentTarget)) return;
        const composite = state.baseRef.current;
        if (!composite) return;
        if (isSafari()) {
          // Safari doesn't scroll into view automatically if the focus changes
          // so fast. So we need to do it manually.
          event.currentTarget.scrollIntoView({
            block: "nearest",
            inline: "nearest",
          });
        }
        hasFocusedComposite.current = true;
        // TODO: Experiment with queueMicrotask after testing the order of
        // the events.
        composite.focus();
      },
      [
        onFocusProp,
        id,
        state?.items,
        state?.setActiveId,
        state?.virtualFocus,
        state?.baseRef,
      ]
    );

    const onBlurCaptureProp = useEventCallback(props.onBlurCapture);

    const onBlurCapture = useCallback(
      (event: FocusEvent<HTMLButtonElement>) => {
        onBlurCaptureProp(event);
        if (event.defaultPrevented) return;
        if (state?.virtualFocus && hasFocusedComposite.current) {
          // When hasFocusedComposite is true, composite has been focused right
          // after focusing on this item. This is an intermediate blur event, so
          // we ignore it.
          hasFocusedComposite.current = false;
          event.preventDefault();
          event.stopPropagation();
        }
      },
      [onBlurCaptureProp, state?.virtualFocus]
    );

    const onKeyDownProp = useEventCallback(props.onKeyDown);
    const preventScrollOnKeyDownProp = useBooleanEventCallback(
      preventScrollOnKeyDown
    );
    const item = useItem(state?.items, id);
    const isGrid = !!item?.rowId;

    const onKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDownProp(event);
        if (event.defaultPrevented) return;
        if (!isSelfTarget(event)) return;
        const isVertical = state?.orientation !== "horizontal";
        const isHorizontal = state?.orientation !== "vertical";
        const keyMap = {
          ArrowUp: (isGrid || isVertical) && state?.up,
          ArrowRight: (isGrid || isHorizontal) && state?.next,
          ArrowDown: (isGrid || isVertical) && state?.down,
          ArrowLeft: (isGrid || isHorizontal) && state?.previous,
          Home: () => {
            if (!isGrid || event.ctrlKey) {
              return state?.first();
            }
            return state?.previous(-1);
          },
          End: () => {
            if (!isGrid || event.ctrlKey) {
              return state?.last();
            }
            return state?.next(-1);
          },
          PageUp: () => {
            return findNextPageItemId(
              event.currentTarget,
              state?.items,
              state?.up,
              true
            );
          },
          PageDown: () => {
            return findNextPageItemId(
              event.currentTarget,
              state?.items,
              state?.down
            );
          },
        };
        const action = keyMap[event.key as keyof typeof keyMap];
        if (action) {
          const nextId = action();
          if (preventScrollOnKeyDownProp(event) || nextId !== undefined) {
            event.preventDefault();
            state?.move(nextId);
          }
          return;
        }
      },
      [
        onKeyDownProp,
        state?.orientation,
        isGrid,
        state?.up,
        state?.next,
        state?.down,
        state?.items,
        state?.previous,
        state?.first,
        state?.last,
        preventScrollOnKeyDownProp,
        state?.move,
      ]
    );

    const providerValue = useMemo(
      () => ({ id, baseRef: state?.baseRef }),
      [id, state?.baseRef]
    );

    props = useWrapElement(
      props,
      (element) => (
        <CompositeItemContext.Provider value={providerValue}>
          {element}
        </CompositeItemContext.Provider>
      ),
      [providerValue]
    );

    const isActiveItem = state?.activeId === id;
    const role = useRole(ref, props);
    let ariaSelected: boolean | undefined;

    if (isActiveItem) {
      if (requiresAriaSelected(role)) {
        // When the active item role _requires_ the aria-selected attribute
        // (e.g., option, treeitem), we always set it to true.
        ariaSelected = true;
      } else if (state?.virtualFocus && supportsAriaSelected(role)) {
        // Otherwise, it will be set to true when virtualFocus is set to true
        // (meaning that the focus will be managed using the
        // aria-activedescendant attribute) and the aria-selected attribute is
        // _supported_ by the active item role.
        ariaSelected = true;
      }
    }

    const shouldTabIndex =
      (!state?.virtualFocus && isActiveItem) ||
      // We don't want to set tabIndex="-1" when using CompositeItem as a
      // standalone component, without state props.
      !state?.items.length;

    props = {
      id,
      "aria-selected": ariaSelected,
      "data-active-item": isActiveItem ? "" : undefined,
      ...props,
      ref: useForkRef(ref, props.ref),
      tabIndex: shouldTabIndex ? props.tabIndex : -1,
      onFocus,
      onBlurCapture,
      onKeyDown,
    };

    props = useCommand(props);
    props = useCollectionItem({
      state,
      ...props,
      getItem,
      shouldRegisterItem: !!id ? props.shouldRegisterItem : false,
    });

    return props;
  }
);

/**
 * A component that renders a composite item.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeState();
 * <Composite state={composite}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 *   <CompositeItem>Item 3</CompositeItem>
 * </Composite>
 * ```
 */
export const CompositeItem = createMemoComponent<CompositeItemOptions>(
  (props) => {
    const htmlProps = useCompositeItem(props);
    return createElement("button", htmlProps);
  }
);

export type CompositeItemOptions<T extends As = "button"> = CommandOptions<T> &
  Omit<CollectionItemOptions<T>, "state"> & {
    /**
     * Object returned by the `useCompositeState` hook. If not provided, the
     * parent `Composite` component's context will be used.
     */
    state?: CompositeState;
    /**
     * The id that will be used to group items in the same row. This is
     * usually retrieved by the `CompositeRow` component through context so in
     * most cases you don't need to set it manually.
     */
    rowId?: string;
    /**
     * Whether the scroll behavior should be prevented when pressing arrow keys
     * on the first or the last items.
     * @default false
     */
    preventScrollOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  };

export type CompositeItemProps<T extends As = "button"> = Props<
  CompositeItemOptions<T>
>;
