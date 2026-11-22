import { getWindow } from "@ariakit/utils";

/** The part of a carousel row, on the screen, that no fade or button covers. */
export interface ClearRange {
  left: number;
  right: number;
}

/**
 * Returns the part of the viewport of a carousel row that its fades and its
 * buttons don't cover. The scroll padding of the viewport holds them.
 */
export function getClearRange(viewport: HTMLElement): ClearRange {
  const style = getWindow(viewport).getComputedStyle(viewport);
  const viewportRect = viewport.getBoundingClientRect();
  const viewportLeft = viewportRect.left + viewport.clientLeft;
  const viewportRight = viewportLeft + viewport.clientWidth;
  return {
    left: viewportLeft + (Number.parseFloat(style.scrollPaddingLeft) || 0),
    right: viewportRight - (Number.parseFloat(style.scrollPaddingRight) || 0),
  };
}

/**
 * Returns how far a row scrolls so that a box lies in the clear range between
 * the fades and the buttons: to the nearest edge of the range, or to its middle
 * when the box doesn't fit. Returns 0 when the box is already clear.
 */
export function getClearOffset(
  rect: Pick<DOMRect, "left" | "right" | "width">,
  clear: ClearRange,
) {
  if (rect.width > clear.right - clear.left) {
    return rect.left + rect.width / 2 - (clear.left + clear.right) / 2;
  }
  if (rect.left < clear.left) {
    return rect.left - clear.left;
  }
  if (rect.right > clear.right) {
    return rect.right - clear.right;
  }
  return 0;
}

/**
 * Returns how far the viewport of a carousel row scrolls so that a box lies in
 * its clear range. Fractional widths can leave an item a fraction of a pixel
 * past the clear range, which still shows it whole, so that returns 0.
 */
export function getViewportClearOffset(
  viewport: HTMLElement,
  rect: Pick<DOMRect, "left" | "right" | "width">,
) {
  const offset = getClearOffset(rect, getClearRange(viewport));
  return Math.abs(offset) < 1 ? 0 : offset;
}

/**
 * Returns how far the viewport of a carousel row can scroll toward the place
 * where a box lies in its clear range. At an end of the row, the box lies as
 * far into the clear range as the row can scroll, so that returns 0.
 */
function getReachableClearOffset(
  viewport: HTMLElement,
  rect: Pick<DOMRect, "left" | "right" | "width">,
) {
  const offset = getViewportClearOffset(viewport, rect);
  if (!offset) return 0;
  const max = viewport.scrollWidth - viewport.clientWidth;
  const rtl =
    getWindow(viewport).getComputedStyle(viewport).direction === "rtl";
  // The scroll position of a right-to-left row goes from 0 down.
  const min = rtl ? -max : 0;
  const end = rtl ? 0 : max;
  const target = Math.min(end, Math.max(min, viewport.scrollLeft + offset));
  const reachable = target - viewport.scrollLeft;
  return Math.abs(reachable) < 1 ? 0 : reachable;
}

/**
 * Scrolls the viewport of a carousel row, and not the page, so an item lies in
 * its clear range. `scrollIntoView` would also scroll the page to show the
 * whole item, and Chrome and Firefox miss the middle of a row whose scroll
 * padding takes the whole row.
 */
export function scrollIntoClearRange(
  viewport: HTMLElement,
  item: Element,
  behavior: ScrollBehavior,
) {
  const offset = getReachableClearOffset(
    viewport,
    item.getBoundingClientRect(),
  );
  if (!offset) return;
  viewport.scrollTo({ left: viewport.scrollLeft + offset, behavior });
}
