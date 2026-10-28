import type { Locator, Page } from "@playwright/test";
import { flushFrames } from "#app/test-utils/preview.ts";

// The slide of the shared popup lasts 150 ms.
const SLIDE_DURATION = 150;

/**
 * Moves the pointer onto an anchor. Ariakit resets hover intent on scroll, so
 * the anchor must be in view before the pointer moves over it.
 */
export async function hoverAnchor(anchor: Locator) {
  await anchor.scrollIntoViewIfNeeded();
  await anchor.hover();
}

/**
 * Waits for the slides that could start after the popup moves. The count is the
 * visible state, but a slide that must not happen leaves it unchanged, so the
 * wait crosses the frames that start a transition and the slide duration.
 */
export async function waitPastSlide(page: Page) {
  await flushFrames(page);
  await page.waitForTimeout(SLIDE_DURATION);
}
