import type { Locator } from "@playwright/test";

/**
 * Moves the pointer onto an anchor. Ariakit resets hover intent on scroll, so
 * the anchor must be in view before the pointer moves over it.
 */
export async function hoverAnchor(anchor: Locator) {
  await anchor.scrollIntoViewIfNeeded();
  await anchor.hover();
}
