import { query } from "@ariakit/test/playwright";
import type { Locator } from "@playwright/test";

type Query = ReturnType<typeof query>;

// The glider is presentation with aria-hidden, so it has no accessible name.
// These probes read its selected box from the DOM and compare it with the box
// of the item that the user selected.
export function getBoxOffset(item: Locator) {
  return item.evaluate((element) => {
    const control = element.closest(".control");
    const group = control?.closest(".glider-group");
    const box = group?.querySelector('.glider-box[data-selected="true"]');
    if (!control || !box) return Number.POSITIVE_INFINITY;
    const itemRect = control.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    return Math.max(
      Math.abs(itemRect.left - boxRect.left),
      Math.abs(itemRect.top - boxRect.top),
      Math.abs(itemRect.width - boxRect.width),
      Math.abs(itemRect.height - boxRect.height),
    );
  });
}

/**
 * Items to select on a scaled page, in groups that place the box in different
 * ways: one in a row, one that scrolls, one that scrolls from right to left,
 * tabs, folder tabs, and a column.
 */
export function getItemsToScale(q: Query) {
  return [
    query(q.article("Glider")).radio("Grid"),
    query(q.article("Scrolling")).radio("Board"),
    query(q.article("Scrolling right to left")).radio("Board"),
    query(q.article("Tabs")).tab("Quarter"),
    query(q.article("Folder tabs")).tab("Month"),
    query(q.article("Vertical navigation")).link("Accessibility"),
  ];
}
