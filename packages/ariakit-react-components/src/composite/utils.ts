import * as Core from "@ariakit/components/composite/composite-store";
import { useSafeLayoutEffect } from "@ariakit/react-utils";
import { subscribe } from "@ariakit/store";
import {
  getActiveElement,
  getDocument,
  isTextField,
  isVisible,
} from "@ariakit/utils";
import { useCallback, useRef } from "react";
import type { CompositeStore, CompositeStoreState } from "./composite-store.ts";

export const flipItems = Core.flipItems;
export const findFirstEnabledItem = Core.findFirstEnabledItem;
export const groupItemsByRows = Core.groupItemsByRows;

const unmountingItems = new WeakSet<Element>();

/** Marks the brief window between a focused item's ref cleanup and removal. */
export function markItemUnmounting(element: Element) {
  if (getActiveElement(element) !== element) return;
  unmountingItems.add(element);
  queueMicrotask(() => unmountingItems.delete(element));
}

/** Clears a transient ref cleanup when React keeps the same node mounted. */
export function markItemMounted(element: Element) {
  unmountingItems.delete(element);
}

/**
 * Runs a callback while preserving the composite element's own scroll position.
 *
 * When virtual focus briefly moves DOM focus from a text input to an item and
 * back, browsers reset the input's internal scroll position (e.g. scrollLeft).
 * Only applies to text field composite elements, to avoid undoing an
 * intentional scroll on scrollable containers.
 */
function withCompositeScrollPreserved(
  store: CompositeStore,
  callback: () => void,
) {
  const { virtualFocus, compositeElement } = store.getState();
  if (!virtualFocus || !compositeElement || !isTextField(compositeElement)) {
    callback();
    return;
  }
  const savedScrollLeft = compositeElement.scrollLeft;
  const savedScrollTop = compositeElement.scrollTop;
  callback();
  compositeElement.scrollLeft = savedScrollLeft;
  compositeElement.scrollTop = savedScrollTop;
}

/**
 * The popup the composite's items live in, when the composite store is also a
 * popup store, as it is for combobox, select and menu.
 */
function getPopupElement(store: CompositeStore) {
  const state = store.getState();
  if (!("contentElement" in state)) return null;
  // Narrowing through `in` widens this to `unknown`, but every store that has
  // the key holds an element or null in it.
  return state.contentElement as HTMLElement | null;
}

/**
 * Whether DOM focus is currently inside the composite: on the composite element
 * itself, on one of its items, or anywhere in its popup.
 */
export function ownsFocus(store: CompositeStore) {
  const { compositeElement } = store.getState();
  const activeElement = getActiveElement(compositeElement);
  if (!activeElement) return false;
  if (compositeElement?.contains(activeElement)) return true;
  if (isItem(store, activeElement)) return true;
  // Items are only recognizable once they register, which is a commit after
  // they mount, and the composite element can sit outside the popup, so
  // neither check above covers an option that has just focused itself.
  return !!getPopupElement(store)?.contains(activeElement);
}

export interface PresentItemParams {
  store: CompositeStore;
  /**
   * The item to present. Defaults to whichever item is active when the
   * presentation runs, which lets an item that hasn't registered yet resolve
   * later. When given, moving to a different item abandons the presentation,
   * because the user has moved on.
   */
  id?: string | null;
  /** Whether to move DOM focus to the item. */
  focus?: boolean;
  /**
   * Whether to bring the item into view only when it is marked as a
   * presentation target. Focus, when requested, still moves either way.
   */
  markedOnly?: boolean;
  /** Whether to abandon the presentation if the composite loses DOM focus. */
  requireFocus?: boolean;
  /**
   * Determines how the item is scrolled into view when it's presented.
   * @private
   */
  scrollIntoView?: (element: HTMLElement) => void;
}

/**
 * Focuses a composite item without scrolling, then brings it into view after
 * any containing popup has been positioned.
 * Returns a function that cancels a pending presentation.
 */
function presentItem({
  store,
  id,
  focus,
  markedOnly,
  requireFocus,
  scrollIntoView,
}: PresentItemParams) {
  let element: HTMLElement | null = null;
  let resolvedId: string | undefined;
  let focused = false;
  let focusLeftElement = false;
  let done = false;
  let wasMounted = false;
  let wasOpen = false;
  const compositeAtStart = store.getState().compositeElement;
  const activeAtStart = getActiveElement(compositeAtStart);
  const owner = requireFocus ? activeAtStart : null;
  // Only focus that would leave the control itself is this widget's to
  // withhold, and that is decided once rather than per pass.
  // https://github.com/ariakit/ariakit/pull/7098#discussion_r3742291859
  const startedOnComposite = !!compositeAtStart?.contains(activeAtStart);
  const stillOwnsFocus = (target: HTMLElement) => {
    if (!owner) return true;
    const activeElement = getActiveElement(owner);
    // Whoever asked for this still has focus.
    if (activeElement === owner) return true;
    // Item/container handoffs still belong to the composite; only focus leaving
    // it abandons the request. Popup descendants remain a known gray area:
    // https://github.com/ariakit/ariakit/issues/7018
    if (activeElement === target) return true;
    return ownsFocus(store);
  };
  // Check state even before the item renders so closed popups cannot leave a
  // pending request behind.
  const abandonedByState = (state: ReturnType<typeof store.getState>) => {
    // Latching distinguishes a popup that closed from one that never opened,
    // such as an `alwaysVisible` menu.
    if ("mounted" in state) {
      if (state.mounted) {
        wasMounted = true;
      } else if (wasMounted) {
        return true;
      }
    }
    // `mounted` stays true for the whole exit transition of an animated popup,
    // so it can't see a close on its own.
    if ("open" in state) {
      if (state.open) {
        wasOpen = true;
      } else if (wasOpen) {
        return true;
      }
    }
    // The user moved on. Clearing the active item doesn't count: the composite
    // does that itself when its element takes focus, while the item it was
    // showing is still the one worth presenting.
    return id != null && state.activeId != null && state.activeId !== id;
  };

  // Whether focusing the item would take DOM focus out of a composite element
  // that isn't in the popup and put it inside a popup that hasn't opened. A
  // collapsed widget keeps focus on itself, the way a native select does while
  // typeahead changes its value. Containment is what separates this from an
  // `alwaysVisible` popup that is its own composite, such as a Menu, where DOM
  // focus is the accessibility cursor and has to follow the active item.
  // https://github.com/ariakit/ariakit/issues/7093
  const entersClosedPopup = (
    state: ReturnType<typeof store.getState>,
    target: HTMLElement,
  ) => {
    if (!("open" in state)) return false;
    if (state.open) return false;
    const popup = getPopupElement(store);
    if (!popup?.contains(target)) return false;
    const { compositeElement } = state;
    if (!compositeElement) return false;
    if (popup.contains(compositeElement)) return false;
    // Focus only reaches a closed popup that is still on screen. Focusing a
    // hidden one is already a no-op, the same reason the scroll below skips it,
    // so withholding there would only keep a request alive for no gain. This
    // reads style, so it goes last.
    return isVisible(target);
  };

  // Follow the active item only until one resolves, then pin its logical id so
  // a replacement node can be found without presenting a different item.
  const resolveElement = (state: ReturnType<typeof store.getState>) => {
    const targetId = resolvedId ?? (id === undefined ? state.activeId : id);
    const item = getEnabledItem(store, targetId);
    if (!item?.element?.isConnected) return null;
    resolvedId = item.id;
    return item.element;
  };
  let removeFocusListeners: (() => void) | undefined;
  let unsubscribe: (() => void) | undefined;
  const cancel = () => {
    done = true;
    removeFocusListeners?.();
    unsubscribe?.();
  };
  const present = () => {
    if (done) return;
    const state = store.getState();
    if (abandonedByState(state)) return cancel();
    let restoreFocus = false;
    if (!element) {
      // The item may not have rendered yet, so keep waiting for it.
      element = resolveElement(state);
      if (!element) return;
    } else if (!element.isConnected) {
      restoreFocus =
        focused &&
        !focusLeftElement &&
        getActiveElement(element) === getDocument(element).body;
      // Re-resolve once so a same-id React replacement can be presented without
      // keeping a permanently removed item pending. An earlier layout-effect
      // wake may still beat passive item registration.
      // https://github.com/ariakit/ariakit/pull/7030#discussion_r3703432937
      element = resolveElement(state);
      if (!element) return cancel();
    }
    // Removing the focused node parks focus on `body`; restore only when ref
    // cleanup identified removal. Explicit blur stays latched until this
    // logical item regains focus.
    // https://github.com/ariakit/ariakit/pull/7030#discussion_r3703432809
    if (restoreFocus) {
      focused = false;
    } else if (!stillOwnsFocus(element)) {
      return cancel();
    }
    // Only the focus half is withheld: a list that is already on screen still
    // scrolls to the item the user just made active.
    const focusWithheld =
      focus && startedOnComposite && entersClosedPopup(state, element);
    // A request parked on positioning keeps presenting the item it resolved,
    // because the popup is open and the wait is short. This one waits for the
    // popup to open at all, so the user has time to pick another item, and the
    // focus it still owes would land on the wrong one.
    if (focusWithheld) {
      const { activeId } = state;
      if (activeId != null && activeId !== resolvedId) return cancel();
    }
    if (focus && !focused && !focusWithheld) {
      focused = true;
      focusLeftElement = false;
      const itemElement = element;
      removeFocusListeners?.();
      const onBlur = () => {
        focusLeftElement = !unmountingItems.has(itemElement);
      };
      const onFocus = () => {
        focusLeftElement = false;
      };
      itemElement.addEventListener("blur", onBlur);
      itemElement.addEventListener("focus", onFocus);
      removeFocusListeners = () => {
        itemElement.removeEventListener("blur", onBlur);
        itemElement.removeEventListener("focus", onFocus);
      };
      withCompositeScrollPreserved(store, () => {
        itemElement.focus({ preventScroll: true });
      });
      // Focus handlers run synchronously and can reach back into the store, so
      // a nested pass may have given up in the meantime.
      if (done) return;
    }
    // Focus may move immediately, but scrolling is reserved for an explicit
    // presentation target; hover and stale active ids must not move the page.
    if (markedOnly && !element.hasAttribute("data-autofocus")) {
      // A withheld request still owes focus, so keep it pending. Only a
      // request with nothing left to give is finished here.
      if (focusWithheld) return;
      return cancel();
    }
    // The item can't be shown yet: a popup that is still hidden while closed,
    // or one that hasn't been positioned yet, would be scrolled to no visible
    // effect or to the wrong place.
    if (!isVisible(element)) return;
    if ("unstable_placing" in state && state.unstable_placing) return;
    // Withheld focus keeps the request alive, so opening the popup still gives
    // the item the focus this pass skipped. Scrolling again while it waits only
    // repeats a nearest-edge scroll, since a closed popup never takes the
    // centering branch, so it settles unless something else moved the list.
    if (!focusWithheld) {
      cancel();
    }
    if (scrollIntoView) {
      scrollIntoView(element);
      return;
    }
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
  };
  // `mounted` and `unstable_placing` live on the merged popup store, which the
  // store type doesn't declare. Naming them keeps the store's keyed listener
  // fast path, which an all-keys subscription would disable for every update
  // while a presentation is pending.
  const keys = [
    "activeId",
    "items",
    "mounted",
    "open",
    "unstable_placing",
  ] as Array<keyof CompositeStoreState>;
  unsubscribe = subscribe(store, keys, present);
  present();
  return cancel;
}

/**
 * Owns at most one pending presentation for the component's current store.
 * Layout-effect ownership prevents store swaps or unmounts from stranding a
 * request, while newer requests replace older ones.
 * Layout setup runs before child passive effects can request presentation;
 * cleanup clears ownership during unmount before later handlers or microtasks
 * can enqueue work. The initial ref covers the first render before setup.
 *
 * See https://github.com/ariakit/ariakit/pull/7029
 */
export function usePresentItem(store?: CompositeStore) {
  const cancelRef = useRef<(() => void) | null>(null);
  const ownerRef = useRef(store);
  const cancel = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
  }, []);
  const present = useCallback(
    (params: Omit<PresentItemParams, "store">) => {
      if (!store) return;
      if (ownerRef.current !== store) return;
      cancel();
      const cancelCurrent = presentItem({ store, ...params });
      cancelRef.current = cancelCurrent;
      return cancelCurrent;
    },
    [store, cancel],
  );
  useSafeLayoutEffect(() => {
    ownerRef.current = store;
    return () => {
      ownerRef.current = undefined;
      cancel();
    };
  }, [store, cancel]);
  return present;
}

/**
 * Returns the store item with the given id (enabled or not), or `null`.
 */
export function getEnabledItem(store: CompositeStore, id?: string | null) {
  if (!id) return null;
  return store.item(id) || null;
}

/**
 * Selects text field contents even if it's a content editable element.
 */
export function selectTextField(element: HTMLElement, collapseToEnd = false) {
  if (isTextField(element)) {
    element.setSelectionRange(
      collapseToEnd ? element.value.length : 0,
      element.value.length,
    );
  } else if (element.isContentEditable) {
    const selection = getDocument(element).getSelection();
    selection?.selectAllChildren(element);
    if (collapseToEnd) {
      selection?.collapseToEnd();
    }
  }
}

const FOCUS_SILENTLY = Symbol("FOCUS_SILENTLY");
type FocusSilentlyElement = HTMLElement & { [FOCUS_SILENTLY]?: boolean };

/**
 * Focus an element with a flag. The `silentlyFocused` function needs to be
 * called later to check if the focus was silenced and to reset this state.
 */
export function focusSilently(element: FocusSilentlyElement) {
  element[FOCUS_SILENTLY] = true;
  element.focus({ preventScroll: true });
}

/**
 * Checks whether the element has been focused with the `focusSilently` function
 * and resets the state.
 */
export function silentlyFocused(element: FocusSilentlyElement) {
  const isSilentlyFocused = element[FOCUS_SILENTLY];
  delete element[FOCUS_SILENTLY];
  return isSilentlyFocused;
}

/**
 * Determines whether the element is a composite item.
 */
export function isItem(
  store: CompositeStore,
  element?: Element | null,
  exclude?: Element,
) {
  if (!element) return false;
  if (element === exclude) return false;
  const item = store.item(element.id);
  if (!item) return false;
  if (exclude && item.element === exclude) return false;
  return true;
}
