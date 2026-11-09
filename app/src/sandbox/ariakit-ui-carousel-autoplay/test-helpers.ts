import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { flushFrames } from "#app/test-utils/preview.ts";

// The fixture sets autoPlayDelay to 1 second.
const DELAY = 1000;

/**
 * Reads the name of the selected slide tab of a carousel, such as "Slide 2".
 */
export function getSelectedSlide(carousel: Locator) {
  return query(carousel)
    .tab(undefined, { selected: true })
    .getAttribute("aria-label");
}

/**
 * Waits past one autoplay delay. The delay starts in an effect after the render
 * that the last interaction caused, and a move selects its slide tab in the
 * render after it, so the wait crosses those frames on each side of the delay.
 */
export async function waitPastDelay(page: Page) {
  await flushFrames(page);
  await page.waitForTimeout(DELAY);
  await flushFrames(page);
}

/**
 * Checks that autoplay doesn't move a carousel during one delay. A move that
 * must not happen leaves no state to wait for, and autoplay comes back to each
 * slide, so the check reads the selection once instead of retrying.
 */
export async function expectNoMove(page: Page, carousel: Locator) {
  const slide = await getSelectedSlide(carousel);
  await waitPastDelay(page);
  expect(await getSelectedSlide(carousel)).toBe(slide);
}

/** Waits until autoplay moves a carousel away from its selected slide. */
export async function expectMove(carousel: Locator) {
  const slide = await getSelectedSlide(carousel);
  await expect.poll(() => getSelectedSlide(carousel)).not.toBe(slide);
}
