import { useEvent, useSafeLayoutEffect } from "@ariakit/react-utils";
import { sync } from "@ariakit/store";
import type { ComboboxStore } from "./combobox-store.ts";

const openingMovesByStore = new WeakMap<ComboboxStore, number>();

function scrollIntoViewNearest(element: HTMLElement) {
  element.scrollIntoView({ block: "nearest", inline: "nearest" });
}

function getSingleVerticalScrollport(element: HTMLElement, popup: HTMLElement) {
  const getComputedStyle = element.ownerDocument.defaultView?.getComputedStyle;
  if (!getComputedStyle) return null;
  if (!getComputedStyle(popup).writingMode.startsWith("horizontal")) {
    return null;
  }
  let scrollport: HTMLElement | null = null;
  let current = element.parentElement;
  while (current && popup.contains(current)) {
    const style = getComputedStyle(current);
    const scrollableOverflow =
      style.overflowY !== "visible" && style.overflowY !== "clip";
    if (scrollableOverflow && current.scrollHeight > current.clientHeight) {
      if (scrollport) return null;
      scrollport = current;
    }
    if (current === popup) break;
    current = current.parentElement;
  }
  return scrollport;
}

function centerItemInScrollport(element: HTMLElement, scrollport: HTMLElement) {
  const elementRect = element.getBoundingClientRect();
  const scrollportRect = scrollport.getBoundingClientRect();
  const scale = scrollportRect.height / scrollport.offsetHeight || 1;
  const elementCenter = elementRect.top + elementRect.height / 2;
  const scrollportCenter =
    scrollportRect.top +
    (scrollport.clientTop + scrollport.clientHeight / 2) * scale;
  scrollport.scrollTop += (elementCenter - scrollportCenter) / scale;
}

export function useTrackComboboxSelectPresentation(store?: ComboboxStore) {
  useSafeLayoutEffect(() => {
    if (!store) return;
    // The select stays mounted across the whole open cycle, while virtualized
    // items can mount after navigation. Record the baseline once here so every
    // item compares against the same opening movement without subscribing.
    const stop = sync(store, ["open"], (state) => {
      // Arrow keys move while the popup is still closed. Capture that movement
      // at each open so the opening presentation still centers; only movement
      // after this point should switch back to nearest-edge scrolling.
      if (state.open) {
        openingMovesByStore.set(store, store.getState().moves);
      } else {
        openingMovesByStore.delete(store);
      }
    });
    return () => {
      stop();
      openingMovesByStore.delete(store);
    };
  }, [store]);
}

export function useScrollItemIntoView(store?: ComboboxStore) {
  return useEvent((element: HTMLElement) => {
    if (!store) return scrollIntoViewNearest(element);
    const { contentElement, moves, selectElement } = store.getState();
    if (!selectElement) return scrollIntoViewNearest(element);
    if (moves !== openingMovesByStore.get(store)) {
      return scrollIntoViewNearest(element);
    }
    if (!contentElement?.contains(element)) {
      return scrollIntoViewNearest(element);
    }
    const scrollport = getSingleVerticalScrollport(element, contentElement);
    if (!scrollport) return scrollIntoViewNearest(element);
    centerItemInScrollport(element, scrollport);
  });
}
