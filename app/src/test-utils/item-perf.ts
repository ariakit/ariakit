// Type-only, so the fixture module and its React import are erased here rather
// than pulled into the Playwright process. Sharing the union keeps the search
// param value this file writes in lockstep with the one the page accepts.
import type { ItemVariant } from "#app/sandbox/_lib/item-variant.ts";

/**
 * Which Ariakit version each side of the paired comparison renders. Both sides
 * run the same revision of the fixture and differ only by the package the items
 * come from, so the pair isolates the library change rather than comparing two
 * checkouts.
 */
const sideVariants = new Map<string, ItemVariant>([
  ["baseline", "legacy"],
  ["current", "head"],
]);

function readItemParam() {
  const side = process.env.PERF_ITEM_SIDE ?? "baseline";
  const variant = sideVariants.get(side);
  if (!variant) {
    const expected = [...sideVariants.keys()].join(", ");
    throw new Error(
      `Invalid PERF_ITEM_SIDE: ${side}. Expected one of ${expected}.`,
    );
  }
  return variant;
}

/** Value the fixture page reads from its `item` search param. */
export const itemParam = readItemParam();

/** Item naming shared by the fixtures that do not pad their item numbers. */
export function getItemName(itemNumber: number) {
  return `Item ${itemNumber}`;
}
