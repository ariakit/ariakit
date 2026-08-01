import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
// Type-only, so the fixture module and its React import are erased here rather
// than pulled into the Playwright process. Sharing the union keeps the search
// param values this file writes in lockstep with the ones the page accepts.
import type { ItemVariant } from "#app/sandbox/_lib/item-variant.ts";
import { flushFrames } from "./preview.ts";

/** Which side of the paired comparison this run records. */
type ComparisonSide = "baseline" | "current";

/**
 * Which paired comparison this job runs. It stays identical on both sides of a
 * pair so baseline and current rows still pair up, and it qualifies the test
 * titles so each comparison keeps its own rows in the aggregated report.
 */
type Comparison = "passive" | "lazy" | "version";

/**
 * What each side of each comparison renders.
 *
 * The offscreen comparisons hold the revision fixed and vary only the item, so
 * they isolate the offscreen items themselves. The version comparison holds the
 * item kind fixed at ordinary items and varies the Ariakit version instead, so
 * it measures how much the ordinary items improved since the offscreen feature
 * shipped in 0.4.14.
 */
const comparisonVariants: Record<
  Comparison,
  Record<ComparisonSide, ItemVariant>
> = {
  passive: { baseline: "base", current: "passive" },
  lazy: { baseline: "base", current: "lazy" },
  version: { baseline: "legacy", current: "base" },
};

function readVariable<T extends string>(
  name: string,
  fallback: T,
  allowed: readonly T[],
): T {
  const value = process.env[name];
  if (!value) return fallback;
  const match = allowed.find((allowedValue) => allowedValue === value);
  if (!match) {
    throw new Error(
      `Invalid ${name}: ${value}. Expected one of ${allowed.join(", ")}.`,
    );
  }
  return match;
}

const side = readVariable<ComparisonSide>("PERF_ITEM_SIDE", "baseline", [
  "baseline",
  "current",
]);

const comparison = readVariable<Comparison>("PERF_ITEM_COMPARISON", "passive", [
  "passive",
  "lazy",
  "version",
]);

/** Value the fixture page reads from its `item` search param. */
export const itemParam = comparisonVariants[comparison][side];

/** Whether the variant this run renders defers item rendering. */
const offscreen = itemParam === "passive" || itemParam === "lazy";

/**
 * Whether this comparison exercises offscreen items at all. The version
 * comparison renders ordinary items on both sides, so scrolling costs both
 * sides nothing and a scroll row there would measure harness overhead rather
 * than product work.
 */
export const comparesOffscreenItems = comparison !== "version";

/**
 * Item height in the fixture stylesheets. Scroll positions are derived from it,
 * so it must stay in sync with the `.item` rule in each fixture.
 */
const itemSize = 32;

/** Items that fit in one fixture root, whose height is 320px. */
const itemsPerScreen = 10;

/** Screens traversed before turning around, covering the first 200 items. */
const scrollScreens = 20;

/**
 * Qualifies a test title with the comparison so each job contributes its own
 * rows to the aggregated report instead of overwriting the other jobs.
 */
export function itemTestTitle(title: string) {
  return `${title} (${comparison})`;
}

/** Maps a 1-based item number to that item's `data-item` value. */
export type GetItemName = (itemNumber: number) => string;

/** Item naming shared by the fixtures that do not pad their item numbers. */
export function getItemName(itemNumber: number) {
  return `Item ${itemNumber}`;
}

/**
 * An item that renders as a real Ariakit item rather than an offscreen
 * placeholder. Ordinary items always match, so the same locator expresses
 * "ready for the user" on both sides of the comparison.
 */
export function materializedItem(page: Page, item: string) {
  return page.locator(`[data-item="${item}"]:not([data-offscreen])`);
}

/**
 * Waits until every item of the screen starting after `itemsAbove` is a real
 * item, so a step ends with the whole visible screen ready for the user on both
 * sides of the comparison.
 *
 * Gating on fewer items would let a step finish while the rest of the screen is
 * still placeholders. That matters most in passive mode, where an activation
 * that is still pending when the next scroll starts is cancelled rather than
 * run, which would drop the work from the measurement instead of deferring it
 * and would credit passive with rebuild work it never paid.
 */
function waitForScreen(page: Page, getName: GetItemName, itemsAbove: number) {
  const selector = Array.from({ length: itemsPerScreen }, (_, index) => {
    const item = getName(itemsAbove + index + 1);
    return `[data-item="${item}"]:not([data-offscreen])`;
  }).join(",");
  return expect(page.locator(selector)).toHaveCount(itemsPerScreen);
}

/**
 * Waits until the items the user can see are real items. This only adds work on
 * the offscreen side, where materializing the visible screen is the point at
 * which the interaction is complete for the user; the baseline reaches that
 * state as soon as its items are attached.
 *
 * It waits for the whole first screen rather than a single sentinel item. Item 1
 * alone would prove nothing on a composite, whose store promotes its active
 * item to `offscreenMode: "active"` and so keeps item 1 materialized no matter
 * what the observer has done.
 */
export async function waitForVisibleItems(
  page: Page,
  getItemName: GetItemName,
) {
  if (!offscreen) return;
  await page.locator("[data-offscreen]").first().waitFor();
  await waitForScreen(page, getItemName, 0);
}

interface ItemScrollParams {
  page: Page;
  /** The scrollable root the items are observed against. */
  scroller: Locator;
  getItemName: GetItemName;
}

/**
 * Scrolls one root height at a time through the top of the list and back up,
 * waiting at every screen for that whole screen to be real items.
 *
 * The return pass is what separates the two offscreen modes: lazy keeps every
 * item it has already materialized, while passive drops items as they leave the
 * root and rebuilds them on the way back. A single downward pass would charge
 * both modes the same materialization cost and hide that difference.
 */
export async function scrollThroughItems({
  page,
  scroller,
  getItemName,
}: ItemScrollParams) {
  const down = Array.from({ length: scrollScreens }, (_, index) => index + 1);
  const up = Array.from(
    { length: scrollScreens },
    (_, index) => scrollScreens - index - 1,
  );
  for (const screen of [...down, ...up]) {
    const itemsAbove = screen * itemsPerScreen;
    await scroller.evaluate((element, top) => {
      element.scrollTo({ top });
    }, itemsAbove * itemSize);
    // The baseline never waits on materialization, so without a frame flush it
    // would issue every scroll without rendering any of them and would not pay
    // the layout work a real scroll costs.
    await flushFrames(page);
    await waitForScreen(page, getItemName, itemsAbove);
  }
}

/**
 * Confirms the scroll interaction ended back at the top with the first screen
 * ready for the user, which is the state both sides must reach.
 */
export async function verifyScrolledThroughItems({
  page,
  scroller,
  getItemName,
}: ItemScrollParams) {
  await expect
    .poll(() => scroller.evaluate((element) => element.scrollTop))
    .toBe(0);
  await waitForScreen(page, getItemName, 0);
}
