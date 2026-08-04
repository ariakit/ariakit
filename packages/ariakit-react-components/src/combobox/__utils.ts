import { useEvent, useSafeLayoutEffect } from "@ariakit/react-utils";
import { sync } from "@ariakit/store";
import type { ComboboxStore } from "./combobox-store.ts";

const openingMovesByStore = new WeakMap<ComboboxStore, number>();

function scrollIntoViewNearest(element: HTMLElement) {
  element.scrollIntoView({ block: "nearest", inline: "nearest" });
}

function getSingleVerticalScrollport(element: HTMLElement, popup: HTMLElement) {
  const view = element.ownerDocument.defaultView;
  if (!view) return null;
  if (!view.getComputedStyle(popup).writingMode.startsWith("horizontal")) {
    return null;
  }
  let scrollport: HTMLElement | null = null;
  let current = element.parentElement;
  while (current && popup.contains(current)) {
    const style = view.getComputedStyle(current);
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
  const scaleX = scrollportRect.width / scrollport.offsetWidth || 1;
  const scrollportLeft = scrollportRect.left + scrollport.clientLeft * scaleX;
  const scrollportRight = scrollportLeft + scrollport.clientWidth * scaleX;
  const scrollportWidth = scrollport.clientWidth * scaleX;
  const elementLeftOutside = elementRect.left < scrollportLeft;
  const elementRightOutside = elementRect.right > scrollportRight;
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
  // Preserve native inline-nearest behavior without scrolling ancestors
  // outside the popup.
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
