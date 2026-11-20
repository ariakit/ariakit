import { invariant } from "@ariakit/utils";
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** The default show and hide timeout. Nothing shows a pending show or hide. */
export const hoverTimeout = 500;

/** Returns the vertical center of the element in the viewport. */
export async function getCenterY(locator: Locator) {
  const box = await locator.boundingBox();
  invariant(box, "The element has no bounding box.");
  return box.y + box.height / 2;
}

/**
 * Turns the mouse wheel by the distance that moves `target` under the mouse,
 * which rests on `current`.
 */
export async function wheelTo(page: Page, current: Locator, target: Locator) {
  const distance = (await getCenterY(target)) - (await getCenterY(current));
  await page.mouse.wheel(0, distance);
}

interface WheelInFrameParams {
  page: Page;
  above: Locator;
  below: Locator;
  frame: Locator;
}

/**
 * Moves the mouse from the gap between two links at the edge of a list into the
 * frame that the list touches. Then turns the wheel over the frame, which can't
 * scroll, so the page scrolls the lower link under the point where the mouse
 * left the page.
 */
export async function wheelInFrame({
  page,
  above,
  below,
  frame,
}: WheelInFrameParams) {
  const aboveBox = await above.boundingBox();
  const belowBox = await below.boundingBox();
  const frameBox = await frame.boundingBox();
  invariant(aboveBox, "The link above has no bounding box.");
  invariant(belowBox, "The link below has no bounding box.");
  invariant(frameBox, "The frame has no bounding box.");
  const gapY = (aboveBox.y + aboveBox.height + belowBox.y) / 2;
  await page.mouse.move(aboveBox.x + aboveBox.width - 2, gapY);
  // One move takes the mouse into the frame, so the page's last mouse move
  // stays at the gap.
  await page.mouse.move(frameBox.x + 40, gapY);
  await page.mouse.wheel(0, (await getCenterY(below)) - gapY);
  await expect
    .poll(async () => Math.abs((await getCenterY(below)) - gapY))
    .toBeLessThan(1);
}
