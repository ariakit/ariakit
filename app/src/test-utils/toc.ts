import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

// The duration of the thumb glide in the toc style recipe.
const GLIDE_DURATION = 200;

function getAnimationCount(nav: Locator) {
  return nav.evaluate((element) => {
    return element.getAnimations({ subtree: true }).length;
  });
}

/**
 * Lets the thumb glide that a scroll starts run to the end. Polling the
 * animations in every frame would add script work that grows with the animated
 * pieces, so this waits for the glide duration and then checks that no piece
 * still animates.
 */
export async function expectTocThumbStill(page: Page, nav: Locator) {
  // The glide runs on a CSS transition with no observable end state, so the
  // wait crosses its duration before the check.
  await page.waitForTimeout(GLIDE_DURATION);
  await expect.poll(() => getAnimationCount(nav)).toBe(0);
}
