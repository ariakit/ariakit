import type { Page } from "@playwright/test";
import { flushFrames } from "./preview.ts";

// Helpers for tests of Ariakit UI popovers that several anchors share, such as
// tooltips and hovercards, in recipes, sandboxes, and app pages.

/**
 * How long the `$slide` variant of the `popoverPositioner` style recipe slides.
 */
export const SLIDE_DURATION = 150;

/**
 * Waits for the slides that could start after a shared popup moves. A slide
 * that must not happen leaves no state to assert, so the wait crosses the
 * frames that start a transition and the slide duration.
 */
export async function waitPastSlide(page: Page) {
  await flushFrames(page);
  await page.waitForTimeout(SLIDE_DURATION);
}
