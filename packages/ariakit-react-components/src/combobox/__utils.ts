import { useSafeLayoutEffect } from "@ariakit/react-utils";
import { sync } from "@ariakit/store";
import { getWindow } from "@ariakit/utils";
import type { RefObject } from "react";
import { useMemo } from "react";
import type { ComboboxStore } from "./combobox-store.ts";

const openingMovesBySelect = new WeakMap<HTMLElement, number>();
const scrollItemIntoViewByStore = new WeakMap<
  ComboboxStore,
  (element: HTMLElement) => void
>();

function scrollIntoViewNearest(element: HTMLElement) {
  element.scrollIntoView({ block: "nearest", inline: "nearest" });
}

function getSingleVerticalScrollport(element: HTMLElement, popup: HTMLElement) {
  const view = getWindow(element);
  if (!view.getComputedStyle(popup).writingMode.startsWith("horizontal")) {
    return null;
  }
  let scrollport: HTMLElement | null = null;
  let inlineScrollport: HTMLElement | null = null;
  let current = element.parentElement;
  while (current && popup.contains(current)) {
    const style = view.getComputedStyle(current);
    const scrollsVertically =
      style.overflowY !== "visible" && style.overflowY !== "clip";
    if (scrollsVertically && current.scrollHeight > current.clientHeight) {
      if (scrollport) return null;
      scrollport = current;
    }
    const scrollsInline =
      style.overflowX !== "visible" && style.overflowX !== "clip";
    if (scrollsInline && current.scrollWidth > current.clientWidth) {
      if (inlineScrollport) return null;
      inlineScrollport = current;
    }
    if (current === popup) break;
    current = current.parentElement;
  }
  // Centering one element cannot keep an item visible through a different
  // inline scrollport. Native nearest scrolling handles every ancestor.
  if (inlineScrollport && inlineScrollport !== scrollport) return null;
  return scrollport;
}

function centerItemInScrollport(element: HTMLElement, scrollport: HTMLElement) {
  const elementRect = element.getBoundingClientRect();
  const scrollportRect = scrollport.getBoundingClientRect();
  const scaleX = scrollportRect.width / scrollport.offsetWidth || 1;
  const scrollportLeft = scrollportRect.left + scrollport.clientLeft * scaleX;
  const scrollportRight = scrollportLeft + scrollport.clientWidth * scaleX;
  const scrollportWidth = scrollport.clientWidth * scaleX;
  const elementLeftOutside = elementRect.left < scrollportLeft;
  const elementRightOutside = elementRect.right > scrollportRight;
  // Mirror CSSOM View's inline `nearest` rules with physical edges so the
  // start/end behavior remains correct for oversized RTL items.
  const alignLeft =
    (elementLeftOutside &&
      !elementRightOutside &&
      elementRect.width < scrollportWidth) ||
    (elementRightOutside &&
      !elementLeftOutside &&
      elementRect.width > scrollportWidth);
  const alignRight =
    (elementLeftOutside &&
      !elementRightOutside &&
      elementRect.width > scrollportWidth) ||
    (elementRightOutside &&
      !elementLeftOutside &&
      elementRect.width < scrollportWidth);
  // Preserve native inline-nearest behavior without scrolling ancestors outside
  // the popup.
  let left = 0;
  if (alignLeft) {
    left = (elementRect.left - scrollportLeft) / scaleX;
  } else if (alignRight) {
    left = (elementRect.right - scrollportRight) / scaleX;
  }

  const scaleY = scrollportRect.height / scrollport.offsetHeight || 1;
  const elementCenter = elementRect.top + elementRect.height / 2;
  const scrollportCenter =
    scrollportRect.top +
    (scrollport.clientTop + scrollport.clientHeight / 2) * scaleY;
  const top = (elementCenter - scrollportCenter) / scaleY;
  scrollport.scrollBy({ left, top });
}

export function useTrackComboboxSelectPresentation(store?: ComboboxStore) {
  useSafeLayoutEffect(() => {
    if (!store) return;
    // The select stays mounted across the whole open cycle, while virtualized
    // items can mount after navigation. Record the baseline once here so every
    // item compares against the same opening movement without subscribing.
    // Items can read another store object that shares this state, like the one
    // ComboboxProvider creates around a store the select also receives, so the
    // baseline is keyed by the select element that all of them share.
    // https://github.com/ariakit/ariakit/issues/7617
    let openingMoves: number | null = null;
    return sync(store, ["open", "selectElement"], (state) => {
      if (!state.open) {
        openingMoves = null;
        return;
      }
      // Arrow keys move while the popup is still closed. Capture that movement
      // at each open so the opening presentation still centers; only movement
      // after this point should switch back to nearest-edge scrolling. A select
      // element that replaces the previous one while the popup stays open keeps
      // the baseline captured when it opened.
      // https://github.com/ariakit/ariakit/pull/7619#discussion_r4088440311
      openingMoves ??= store.getState().moves;
      const { selectElement } = store.getState();
      if (!selectElement) return;
      openingMovesBySelect.set(selectElement, openingMoves);
      // Runs when the popup closes, the select element changes, or the select
      // unmounts, and removes the entry recorded for this element.
      return () => {
        openingMovesBySelect.delete(selectElement);
      };
    });
  }, [store]);
}

/**
 * Returns the store's item-scrolling callback. It reads current store state
 * when called, so every item can share one stable callback per store.
 */
export function getScrollItemIntoView(store?: ComboboxStore) {
  if (!store) return scrollIntoViewNearest;
  const cached = scrollItemIntoViewByStore.get(store);
  if (cached) return cached;
  const scrollItemIntoView = (element: HTMLElement) => {
    const { contentElement, moves, selectElement } = store.getState();
    if (!selectElement) return scrollIntoViewNearest(element);
    if (moves !== openingMovesBySelect.get(selectElement)) {
      return scrollIntoViewNearest(element);
    }
    if (!contentElement?.contains(element)) {
      return scrollIntoViewNearest(element);
    }
    const scrollport = getSingleVerticalScrollport(element, contentElement);
    if (!scrollport) return scrollIntoViewNearest(element);
    centerItemInScrollport(element, scrollport);
  };
  scrollItemIntoViewByStore.set(store, scrollItemIntoView);
  return scrollItemIntoView;
}

function createMovedItemTracker(store: ComboboxStore) {
  let openingMoves: number | null = null;
  const ref: RefObject<HTMLElement | null> = {
    get current() {
      if (openingMoves == null) return null;
      const { activeId, moves } = store.getState();
      if (moves === openingMoves) return null;
      return store.item(activeId)?.element || null;
    },
  };
  // `sync` also runs on subscription, which records the baseline for a popup
  // that only mounts once it's open.
  const track = () =>
    sync(store, ["open"], (state) => {
      openingMoves = state.open ? store.getState().moves : null;
    });
  return { ref, track };
}

/**
 * Returns a ref to the item that the user moved to since the popup opened. Its
 * value is `null` until the user moves. It reads the current store state when
 * accessed, so the popup's delayed initial focus can find the item without
 * subscribing to movement.
 */
export function useMovedItemRef(store: ComboboxStore) {
  const tracker = useMemo(() => createMovedItemTracker(store), [store]);
  // The popup records its own opening baseline. The select can hold another
  // store object with the same state, such as when only the select receives the
  // store prop and the provider wraps it in a store of its own.
  // https://github.com/ariakit/ariakit/pull/7614#discussion_r4082271058
  useSafeLayoutEffect(() => tracker.track(), [tracker]);
  return tracker.ref;
}
