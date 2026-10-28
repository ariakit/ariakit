import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const ringColor = "rgb(59, 130, 246)";

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Element has no bounding box");
  }
  return box;
}

/**
 * Returns the distance between the left edge of the popup and the left edge of
 * its arrow.
 */
async function getArrowLeftInset(popup: Locator) {
  const popupBox = await getBox(popup);
  const arrowBox = await getBox(popup.locator(".arrow"));
  return arrowBox.x - popupBox.x;
}

/**
 * Returns the horizontal extent of each rounded end of a pill. A pill wider
 * than it is tall ends in semicircles with a radius of half its height, so its
 * top and bottom sides are straight only between those ends.
 */
async function getPillRadius(tooltip: Locator) {
  const box = await getBox(tooltip);
  return box.height / 2;
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("arrow takes the new theme colors when the popover opens after a theme switch", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("Themed popover");
    await disclosure.click();
    const dialog = q.dialog("Themed popover");
    const arrow = dialog.locator(".arrow");
    await test.expect(arrow).toHaveCSS("fill", "rgb(255, 255, 255)");
    await test.expect(arrow).toHaveCSS("stroke", ringColor);
    await test.expect(arrow).toHaveCSS("stroke-width", "2px");

    await page.keyboard.press("Escape");
    await test.expect(dialog).toBeHidden();
    await q.checkbox("Dark theme").check();

    // The switch happened while the popover was closed and re-rendered nothing
    // inside it, so only a fresh read on open can pick up the dark colors.
    await disclosure.click();
    await test.expect(dialog).toBeVisible();
    await test.expect(arrow).toHaveCSS("fill", "rgb(15, 23, 42)");
    await test.expect(arrow).toHaveCSS("stroke", "rgb(250, 204, 21)");
    await test.expect(arrow).toHaveCSS("stroke-width", "4px");
  });

  // See https://github.com/ariakit/ariakit/issues/8090
  test("arrow follows the new corner radius when the tooltip opens after a shape change", async ({
    page,
    q,
  }) => {
    await q.radio("Square").check();
    const anchor = q.button("Star");
    await anchor.hover();
    const tooltip = q.tooltip("Add to favorites");
    await test.expect(tooltip).toBeVisible();

    // Square corners leave the whole bottom side straight, so the arrow can
    // move up to the minimum 4px padding next to the corner.
    await test.expect.poll(() => getArrowLeftInset(tooltip)).toBeCloseTo(4, 0);

    await page.mouse.move(0, 0);
    await test.expect(tooltip).toBeHidden();
    await q.radio("Pill").check();

    await anchor.hover();
    await test.expect(tooltip).toBeVisible();
    const radius = await getPillRadius(tooltip);
    await test.expect
      .poll(() => getArrowLeftInset(tooltip))
      .toBeCloseTo(radius, 0);
  });
});
