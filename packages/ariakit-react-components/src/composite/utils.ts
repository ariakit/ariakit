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
}

/**
 * Presents a composite item: moves DOM focus to it without letting the browser
 * scroll, then brings it into view once its popup, if it's in one, has been
 * positioned. Returns a function that abandons a presentation that hasn't run
 * yet.
 *
 * Focus and scroll are separated on purpose. Moving focus is bookkeeping and
 * must never move anything, so it can happen right away; bringing the item into
 * view is the only part that can move the page, so it's the only part that has
 * to wait for the popup to be placed.
 */
function presentItem({
  store,
  id,
  focus,
  markedOnly,
  requireFocus,
}: PresentItemParams) {
  let element: HTMLElement | null = null;
  let resolvedId: string | undefined;
  let focused = false;
  let done = false;
  let wasMounted = false;
  let wasOpen = false;
  const owner = requireFocus
    ? getActiveElement(store.getState().compositeElement)
    : null;
  const stillOwnsFocus = (target: HTMLElement) => {
    if (!owner) return true;
    const activeElement = getActiveElement(owner);
    // Whoever asked for this still has focus.
    if (activeElement === owner) return true;
    // Focus moving inside the composite is the presentation's own doing, not
    // the user moving on. A request that moves focus hands it to the item and
    // the item hands it back, and the composite element it comes back to isn't
    // always the one that asked, because that element can change identity while
    // a popup opens. The item's handoff request is the same shape seen from the
    // other side: it doesn't move focus itself, but it's created midway through
    // a handoff that does. So the question is whether the composite still has
    // focus, not whether the element that asked still does.
    // How wide "the composite" should be is still open: `ownsFocus` counts any
    // popup descendant, which can't tell a mid-flight handoff apart from the
    // user moving to another control in the popup.
    // See https://github.com/ariakit/ariakit/issues/7018
    if (activeElement === target) return true;
    return ownsFocus(store);
  };
  /**
   * Whether the request has stopped being relevant, judged from state alone.
   * Runs on every pass, including the ones that are still waiting for the item
   * to render, so a popup that opens and closes again while an item never
   * arrives doesn't leave the request behind.
   */
  const abandonedByState = (state: ReturnType<typeof store.getState>) => {
    // The popup opened and closed again. Closing content is never presented
    // into. Both are latched so that "never opened" stays distinguishable from
    // "was open, now closing": a popup that is permanently closed, such as an
    // `alwaysVisible` menu, still presents its items.
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

  /**
   * The element the request's item is currently rendered as, or `null` when it
   * isn't rendered. Resolved from the store every time, because the element an
   * id points at is not stable.
   *
   * The id itself is pinned once an element is found. A request without an `id`
   * follows the active item only while it is still looking for one, which is
   * what lets an item that hasn't registered yet resolve later. After that it
   * has adopted a logical item, and `abandonedByState` deliberately doesn't end
   * it when the active item changes, so re-reading the active id here would let
   * it silently present a different item instead.
   */
  const resolveElement = (state: ReturnType<typeof store.getState>) => {
    const targetId = resolvedId ?? (id === undefined ? state.activeId : id);
    const item = getEnabledItem(store, targetId);
    if (!item?.element?.isConnected) return null;
    resolvedId = item.id;
    return item.element;
  };
  let unsubscribe: (() => void) | undefined;
  const cancel = () => {
    done = true;
    unsubscribe?.();
  };
  const present = () => {
    if (done) return;
    const state = store.getState();
    if (abandonedByState(state)) return cancel();
    if (!element) {
      // The item may not have rendered yet, so keep waiting for it.
      element = resolveElement(state);
      if (!element) return;
    } else if (!element.isConnected) {
      // The element left the DOM, but React can replace an item's node while
      // keeping its id, so the logical item can still be there and still be
      // worth presenting. Resolve it again here rather than going back to
      // waiting, which is what keeps the request terminal without counting
      // retries.
      //
      // The replacement is only guaranteed to be there when this pass was woken
      // by the collection's own batched `items` propagation, which carries a
      // commit's unregister and register together. A pass woken earlier in that
      // same commit still sees the old element, because items register from a
      // passive effect while a controlled `items` or `activeId` prop is
      // published from a layout effect. Such a pass gives up on the
      // replacement, which is what already happened to every replacement before
      // this.
      element = resolveElement(state);
      if (!element) return cancel();
    }
    // Whether the request has stopped being relevant, judged from the resolved
    // item. This can only be answered once the item exists: before that there
    // is nothing to compare focus against, and an option that has just focused
    // itself isn't even recognizable as an item yet.
    //
    // A request whose item still holds DOM focus when that item is replaced
    // ends here, because the browser parks focus on the body when it removes
    // the focused node. It only gets that far with an owner to compare against,
    // and only where the item keeps DOM focus: a virtual-focus item that hands
    // focus straight back to the composite element moves no focus at all when
    // its node is replaced. A `Menu` moved while focus is already inside it
    // therefore keeps the behavior a replaced item had before this, while the
    // same menu moved from outside has no owner and gets this far. Only as far
    // as the scroll, though: the focus step below is latched to the element the
    // request first resolved, so a replacement is brought into view without
    // being focused in its place.
    //
    // Telling a removed focused node apart from focus escaping is deliberately
    // not attempted here: the signal would have to be carried down from the
    // re-resolution above, into an ordering that just gained a focus-escape
    // guarantee.
    // See https://github.com/ariakit/ariakit/issues/7042
    if (!stillOwnsFocus(element)) return cancel();
    if (focus && !focused) {
      focused = true;
      const itemElement = element;
      withCompositeScrollPreserved(store, () => {
        itemElement.focus({ preventScroll: true });
      });
      // Focus handlers run synchronously and can reach back into the store, so
      // a nested pass may have given up in the meantime.
      if (done) return;
    }
    // Everything above moves nothing beyond DOM focus, so it runs as soon as
    // it can. Everything below moves the page.
    //
    // Arriving at the composite is not by itself a request to move anything:
    // the item under a resting pointer, or the one a stale active id points at,
    // should be focused but stay where it is. Only an item the widget marked as
    // its presentation target is worth bringing into view. This deliberately
    // isn't an abandon reason, so that the focus above still happens.
    if (markedOnly && !element.hasAttribute("data-autofocus")) return cancel();
    // The item can't be shown yet: a popup that is still hidden while closed,
    // or one that hasn't been positioned yet, would be scrolled to no visible
    // effect or to the wrong place.
    if (!isVisible(element)) return;
    if ("unstable_placing" in state && state.unstable_placing) return;
    cancel();
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
 * Gives a component a single owner for the presentations it asks for, so no
 * call site has to track them itself. Keeps at most one pending presentation
 * per component, so the newest request wins: that's what lets a later move take
 * over from the presentation an open scheduled, while an activity that only
 * changes the active item without asking for a new presentation, such as hover,
 * leaves the pending one alone.
 *
 * The owner is the store the component is currently rendering with, recorded in
 * a layout effect. Two things follow from that. Cancellation is scoped to the
 * store the request was made against, so a component that swaps its `store`
 * prop can't cancel the incoming store's request or strand the outgoing one.
 * And a request asked for once the owner is gone is refused rather than
 * created, which for some requests is the only thing that can stop them.
 * `presentItem` retires a parked request through the popup state it watches or
 * the item id it was given, so one with neither, on a store that outlives the
 * component, would stay there for good.
 *
 * Layout is what makes the second part work in both directions. Its cleanup
 * runs while the unmount is still being committed, before any event handler or
 * microtask that follows it, and its setup runs before every passive setup in
 * the commit, including those of children that ask for a presentation of their
 * own. The initial value covers the render before the first setup.
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
