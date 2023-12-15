import type {
  FocusEvent,
  KeyboardEvent,
  RefObject,
  SyntheticEvent,
} from "react";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import {
  getScrollingElement,
  isButton,
  isTextField,
} from "@ariakit/core/utils/dom";
import { isPortalEvent, isSelfTarget } from "@ariakit/core/utils/events";
import { disabledFromProps } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { CollectionItemOptions } from "../collection/collection-item.js";
import { useCollectionItem } from "../collection/collection-item.js";
import type { CommandOptions } from "../command/command.js";
import { useCommand } from "../command/command.js";
import {
  useBooleanEvent,
  useEvent,
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
} from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import {
  createElement,
  createHook,
  createMemoComponent,
} from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import {
  CompositeItemContext,
  CompositeRowContext,
  useCompositeContext,
} from "./composite-context.js";
import type { CompositeStore } from "./composite-store.js";
import { focusSilently, getEnabledItem, isItem } from "./utils.js";

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
  store?: CompositeStore,
  next?: CompositeStore["next"],
  pageUp = false,
) {
  if (!store) return;
  if (!next) return;
  const { renderedItems } = store.getState();
  const scrollingElement = getScrollingElement(element);
  if (!scrollingElement) return;
  const nextPageOffset = getNextPageOffset(scrollingElement, pageUp);
  let id: string | null | undefined;
  let prevDifference: number | undefined;
  // We need to loop through the next items to find the one that is closest to
  // the next page offset.
  for (let i = 0; i < renderedItems.length; i += 1) {
    const previousId = id;
    id = next(i);
    if (!id) break;
    if (id === previousId) continue;
    const itemElement = getEnabledItem(store, id)?.element;
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

function targetIsAnotherItem(event: SyntheticEvent, store: CompositeStore) {
  if (isSelfTarget(event)) return false;
  return isItem(store, event.target as HTMLElement);
}

function useRole(ref: RefObject<HTMLElement>, props: CompositeItemProps) {
  const roleProp = props.role;
  const [role, setRole] = useState(roleProp);

  useSafeLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setRole(element.getAttribute("role") || roleProp);
  }, [roleProp]);

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
 * Returns props to create a `CompositeItem` component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useCompositeItem({ store });
 * <Role {...props}>Item 1</Role>
 * ```
 */
export const useCompositeItem = createHook<CompositeItemOptions>(
  ({
    store,
    rowId: rowIdProp,
    preventScrollOnKeyDown = false,
    moveOnKeyPress = true,
    tabbable = false,
    getItem: getItemProp,
    "aria-setsize": ariaSetSizeProp,
    "aria-posinset": ariaPosInSetProp,
    ...props
  }) => {
    const context = useCompositeContext();
    store = store || context;

    const id = useId(props.id);
    const ref = useRef<HTMLButtonElement>(null);
    const row = useContext(CompositeRowContext);
    const rowId = useStoreState(store, (state) => {
      if (rowIdProp) return rowIdProp;
      if (!state) return;
      if (!row?.baseElement) return;
      if (row.baseElement !== state.baseElement) return;
      return row.id;
    });
    const disabled = disabledFromProps(props);
    const trulyDisabled = disabled && !props.accessibleWhenDisabled;

    const getItem = useCallback<NonNullable<CollectionItemOptions["getItem"]>>(
      (item) => {
        const nextItem = {
          ...item,
          id: id || item.id,
          rowId,
          disabled: !!trulyDisabled,
        };
        if (getItemProp) {
          return getItemProp(nextItem);
        }
        return nextItem;
      },
      [id, rowId, trulyDisabled, getItemProp],
    );

    const onFocusProp = props.onFocus;
    const hasFocusedComposite = useRef(false);

    const onFocus = useEvent((event: FocusEvent<HTMLButtonElement>) => {
      onFocusProp?.(event);
      if (event.defaultPrevented) return;
      if (isPortalEvent(event)) return;
      if (!id) return;
      if (!store) return;
      const { activeId, virtualFocus, baseElement } = store.getState();
      // If the target is another item, this probably means that composite items
      // are nested. This is okay when building, for example, tree or treegrid
      // elements. In this case, we just ignore the focus event on this parent
      // item.
      if (targetIsAnotherItem(event, store)) return;
      if (activeId !== id) {
        store.setActiveId(id);
      }
      // When using aria-activedescendant, we want to make sure that the
      // composite container receives focus, not the composite item.
      if (!virtualFocus) return;
      // But we'll only do this if the focused element is the composite item
      // itself
      if (!isSelfTarget(event)) return;
      // and the composite item is not a text field or contenteditable element.
      if (isEditableElement(event.currentTarget)) return;
      // We need to verify if the base element is connected to the DOM to avoid
      // a scroll jump on Safari. This is necessary when the base element is
      // removed from the DOM just before triggering this focus event.
      if (!baseElement?.isConnected) return;
      hasFocusedComposite.current = true;
      // If the previously focused element is a composite or composite item
      // component, we'll transfer focus silently to the composite element.
      // That's because this is just a transition event, the composite element
      // was likely already focused, so we're just immediately returning focus
      // to it when navigating through the items.
      const fromComposite =
        event.relatedTarget === baseElement ||
        isItem(store, event.relatedTarget);
      if (fromComposite) {
        focusSilently(baseElement);
      }
      // Otherwise, the composite element is likely not focused, so we need this
      // focus event to propagate so consumers can use the onFocus prop on
      // <Composite>.
      else {
        baseElement.focus();
      }
    });

    const onBlurCaptureProp = props.onBlurCapture;

    const onBlurCapture = useEvent((event: FocusEvent<HTMLButtonElement>) => {
      onBlurCaptureProp?.(event);
      if (event.defaultPrevented) return;
      const state = store?.getState();
      if (state?.virtualFocus && hasFocusedComposite.current) {
        // When hasFocusedComposite is true, composite has been focused right
        // after focusing on this item. This is an intermediate blur event, so
        // we ignore it.
        hasFocusedComposite.current = false;
        event.preventDefault();
        event.stopPropagation();
      }
    });

    const onKeyDownProp = props.onKeyDown;
    const preventScrollOnKeyDownProp = useBooleanEvent(preventScrollOnKeyDown);
    const moveOnKeyPressProp = useBooleanEvent(moveOnKeyPress);

    const onKeyDown = useEvent((event: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (!isSelfTarget(event)) return;
      if (!store) return;
      const { currentTarget } = event;
      const state = store.getState();
      const item = store.item(id);
      const isGrid = !!item?.rowId;
      const isVertical = state.orientation !== "horizontal";
      const isHorizontal = state.orientation !== "vertical";
      const keyMap = {
        ArrowUp: (isGrid || isVertical) && store.up,
        ArrowRight: (isGrid || isHorizontal) && store.next,
        ArrowDown: (isGrid || isVertical) && store.down,
        ArrowLeft: (isGrid || isHorizontal) && store.previous,
        Home: () => {
          if (!isGrid || event.ctrlKey) {
            return store?.first();
          }
          return store?.previous(-1);
        },
        End: () => {
          if (!isGrid || event.ctrlKey) {
            return store?.last();
          }
          return store?.next(-1);
        },
        PageUp: () => {
          return findNextPageItemId(currentTarget, store, store?.up, true);
        },
        PageDown: () => {
          return findNextPageItemId(currentTarget, store, store?.down);
        },
      };
      const action = keyMap[event.key as keyof typeof keyMap];
      if (action) {
        const nextId = action();
        if (preventScrollOnKeyDownProp(event) || nextId !== undefined) {
          if (!moveOnKeyPressProp(event)) return;
          event.preventDefault();
          store.move(nextId);
        }
      }
    });

    const baseElement = useStoreState(
      store,
      (state) => state?.baseElement || undefined,
    );

    const providerValue = useMemo(
      () => ({ id, baseElement }),
      [id, baseElement],
    );

    props = useWrapElement(
      props,
      (element) => (
        <CompositeItemContext.Provider value={providerValue}>
          {element}
        </CompositeItemContext.Provider>
      ),
      [providerValue],
    );

    const isActiveItem = useStoreState(
      store,
      (state) => !!state && state.activeId === id,
    );
    const virtualFocus = useStoreState(store, "virtualFocus");
    const role = useRole(ref, props);
    let ariaSelected: boolean | undefined;

    if (isActiveItem) {
      if (requiresAriaSelected(role)) {
        // When the active item role _requires_ the aria-selected attribute
        // (e.g., option, treeitem), we always set it to true.
        ariaSelected = true;
      } else if (virtualFocus && supportsAriaSelected(role)) {
        // Otherwise, it will be set to true when virtualFocus is set to true
        // (meaning that the focus will be managed using the
        // aria-activedescendant attribute) and the aria-selected attribute is
        // _supported_ by the active item role.
        ariaSelected = true;
      }
    }

    const ariaSetSize = useStoreState(store, (state) => {
      if (ariaSetSizeProp != null) return ariaSetSizeProp;
      if (!state) return;
      if (!row?.ariaSetSize) return;
      if (row.baseElement !== state.baseElement) return;
      return row.ariaSetSize;
    });

    const ariaPosInSet = useStoreState(store, (state) => {
      if (ariaPosInSetProp != null) return ariaPosInSetProp;
      if (!state) return;
      if (!row?.ariaPosInSet) return;
      if (row.baseElement !== state.baseElement) return;
      const itemsInRow = state.renderedItems.filter(
        (item) => item.rowId === rowId,
      );
      return row.ariaPosInSet + itemsInRow.findIndex((item) => item.id === id);
    });

    const isTabbable = useStoreState(store, (state) => {
      if (!state?.renderedItems.length) return true;
      if (state.virtualFocus) return false;
      if (tabbable) return true;
      return state.activeId === id;
    });

    props = {
      id,
      "aria-selected": ariaSelected,
      "data-active-item": isActiveItem ? "" : undefined,
      ...props,
      ref: useMergeRefs(ref, props.ref),
      tabIndex: isTabbable ? props.tabIndex : -1,
      onFocus,
      onBlurCapture,
      onKeyDown,
    };

    props = useCommand(props);
    props = useCollectionItem({
      store,
      ...props,
      getItem,
      shouldRegisterItem: !!id ? props.shouldRegisterItem : false,
    });

    return {
      ...props,
      "aria-setsize": ariaSetSize,
      "aria-posinset": ariaPosInSet,
    };
  },
);

/**
 * Renders a composite item.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 * <Composite store={composite}>
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
  },
);

if (process.env.NODE_ENV !== "production") {
  CompositeItem.displayName = "CompositeItem";
}

export interface CompositeItemOptions<T extends As = "button">
  extends CommandOptions<T>,
    CollectionItemOptions<T> {
  /**
   * Object returned by the
   * [`useCompositeStore`](https://ariakit.org/reference/use-composite-store)
   * hook. If not provided, the closest
   * [`Composite`](https://ariakit.org/reference/composite) or
   * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
   * components' context will be used.
   */
  store?: CompositeStore;
  /**
   * The id that will be used to group items in the same row. This is usually
   * retrieved by the
   * [`CompositeRow`](https://ariakit.org/reference/composite-row) component
   * through context so in most cases you don't need to set it manually.
   */
  rowId?: string;
  /**
   * Whether the scroll behavior should be prevented when pressing arrow keys on
   * the first or the last items.
   * @default false
   */
  preventScrollOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * Whether pressing arrow keys should move the focus to a different item.
   * @default true
   */
  moveOnKeyPress?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
  /**
   * When the `tabbable` prop is set to `true`, the [roving
   * tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex)
   * method is partially disabled for this element. This means that the
   * `tabIndex` prop won't be assigned `-1` when the item is inactive. In
   * addition to using arrow keys, users will be able to tab to this element,
   * leading to the composite widget no longer existing as a single tab stop.
   *
   * As per the [ARIA spec](https://w3c.github.io/aria/#composite):
   *
   * > Authors **SHOULD** ensure that a composite widget exists as a single
   * > navigation stop within the larger navigation system of the web page.
   *
   * Additionally, as stated in
   * [RFC-2119](https://www.rfc-editor.org/rfc/rfc2119.txt):
   *
   * > **SHOULD** This word, or the adjective "RECOMMENDED", mean that there may
   * > exist valid reasons in particular circumstances to ignore a particular
   * > item, but the full implications must be understood and carefully weighed
   * > before choosing a different course.
   *
   * Therefore, while this may be allowed, you should think carefully about the
   * implications of using this prop.
   *
   * **Note**: This prop has no effect when the
   * [`virtualFocus`](https://ariakit.org/reference/composite-provider#virtualfocus)
   * option is enabled.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   */
  tabbable?: boolean;
}

export type CompositeItemProps<T extends As = "button"> = Props<
  CompositeItemOptions<T>
>;
