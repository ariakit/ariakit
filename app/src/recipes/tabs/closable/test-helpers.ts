import type { Locator } from "@playwright/test";

/**
 * Returns how much the widths of two new notes differ. The new notes have names
 * of the same length, so the last note has grown in when it is as wide as the
 * note before it.
 */
export async function getGrowthGap(last: Locator, previous: Locator) {
  const [lastBox, previousBox] = await Promise.all([
    last.boundingBox(),
    previous.boundingBox(),
  ]);
  if (!lastBox || !previousBox) return Number.POSITIVE_INFINITY;
  return Math.abs(lastBox.width - previousBox.width);
}
