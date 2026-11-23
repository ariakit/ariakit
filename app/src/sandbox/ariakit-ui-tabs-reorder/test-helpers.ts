import { query } from "@ariakit/test/playwright";
import type { Locator } from "@playwright/test";

export interface Point {
  x: number;
  y: number;
}

export async function getCenter(locator: Locator): Promise<Point> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no bounding box.");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export async function getLeft(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no bounding box.");
  return box.x;
}

/** The names of the tabs of a tab list, in the order of the page. */
export function getTabNames(list: Locator) {
  return query(list).tab().allTextContents();
}
