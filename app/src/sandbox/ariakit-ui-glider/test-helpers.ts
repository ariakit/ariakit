import { query } from "@ariakit/test/playwright";
import type { Locator } from "@playwright/test";

type Query = ReturnType<typeof query>;

// The glider is presentation with aria-hidden, so it has no accessible name.
// These probes read its selected box from the DOM and compare it with the box
// of the item that the user selected.
export function getBoxOffset(item: Locator) {
  return item.evaluate((element) => {
    const control = element.closest(".ui-control");
    const group = control?.closest(".ui-glider-group");
    const box = group?.querySelector('.ui-glider-box[data-selected="true"]');
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

// The easing of the travel in the glider style recipe: cubic-bezier(0.3,0,0,1).
const TRAVEL_EASING = [0.3, 0, 0, 1] as const;

function getBezierPoint(first: number, second: number, time: number) {
  const rest = 1 - time;
  return (
    3 * first * rest * rest * time + 3 * second * rest * time ** 2 + time ** 3
  );
}

/**
 * Returns the part of the distance, from 0 to 1, that a travel of the glider
 * covers in `elapsed` milliseconds of a `duration` travel time. Tests compare
 * the box with it, because the time that a probe takes depends on the frames of
 * the machine.
 */
export function getTravelProgress(elapsed: number, duration: number) {
  const [x1, y1, x2, y2] = TRAVEL_EASING;
  const timeProgress = Math.min(Math.max(elapsed / duration, 0), 1);
  // Find the curve parameter of the time progress, then the travel at it.
  let low = 0;
  let high = 1;
  for (let i = 0; i < 50; i++) {
    const middle = (low + high) / 2;
    if (getBezierPoint(x1, x2, middle) < timeProgress) {
      low = middle;
    } else {
      high = middle;
    }
  }
  return getBezierPoint(y1, y2, (low + high) / 2);
}

/**
 * Returns the largest part of the distance, from 0 to 1, that a travel of the
 * glider covers in any `span` milliseconds of a `duration` travel time. A probe
 * can then bound how far the box moves between two reads when it can't know
 * when the travel started.
 */
export function getLargestTravel(span: number, duration: number) {
  let largest = 0;
  for (let elapsed = 0; elapsed <= duration; elapsed++) {
    const travel =
      getTravelProgress(elapsed + span, duration) -
      getTravelProgress(elapsed, duration);
    largest = Math.max(largest, travel);
  }
  return largest;
}
