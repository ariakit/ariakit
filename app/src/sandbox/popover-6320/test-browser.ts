// See https://github.com/ariakit/ariakit/issues/6320
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Element has no bounding box");
  }
  return box;
}

async function getHorizontalCenter(locator: Locator) {
  const box = await getBox(locator);
  return box.x + box.width / 2;
}

async function isAbove(locator: Locator, reference: Locator) {
  const box = await getBox(locator);
  const referenceBox = await getBox(reference);
  return box.y + box.height <= referenceBox.y;
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("arrow keeps pointing at the anchor after the popover flips on scroll in RTL", async ({
    q,
  }) => {
    const disclosure = q.button("Accept invite");
    await disclosure.click();

    const popover = q.dialog("Team meeting");
    await test.expect(popover).toBeVisible();
    const arrow = popover.locator(".arrow");

    // Sanity-check the initial `right` placement: the popover opens on the
    // physical right of the anchor with the arrow vertically pointing at it.
    const anchorBox = await getBox(disclosure);
    const popoverBox = await getBox(popover);
    test
      .expect(popoverBox.x)
      .toBeGreaterThanOrEqual(anchorBox.x + anchorBox.width);
    const arrowBox = await getBox(arrow);
    const arrowCenterY = arrowBox.y + arrowBox.height / 2;
    test.expect(arrowCenterY).toBeGreaterThanOrEqual(anchorBox.y);
    test
      .expect(arrowCenterY)
      .toBeLessThanOrEqual(anchorBox.y + anchorBox.height);

    // Scroll the container so the anchor lands near its right edge, leaving no
    // room for the popover on the right. The `flip` middleware then moves the
    // popover above the anchor while it stays open. Scroll by the measured
    // distance so the test doesn't depend on RTL scrollLeft coordinates.
    await disclosure.evaluate((element) => {
      const scroller = element.closest(".scroller");
      if (!scroller) {
        throw new Error("Scroller not found");
      }
      const anchorRect = element.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      const distance = scrollerRect.right - 40 - anchorRect.right;
      scroller.scrollBy({ left: -distance });
    });
    await test.expect.poll(() => isAbove(popover, disclosure)).toBe(true);

    // After the flip, the arrow's horizontal center must fall within the
    // anchor's span. Before the fix, the stale `right: 100%` from the initial
    // placement wins over `left` in RTL and pins the arrow to the popover's
    // left edge, outside the popover and away from the anchor.
    const flippedAnchorBox = await getBox(disclosure);
    await test.expect
      .poll(() => getHorizontalCenter(arrow))
      .toBeGreaterThanOrEqual(flippedAnchorBox.x);
    await test.expect
      .poll(() => getHorizontalCenter(arrow))
      .toBeLessThanOrEqual(flippedAnchorBox.x + flippedAnchorBox.width);
  });

  test("arrow keeps pointing at the anchor after a placement change in RTL", async ({
    q,
  }) => {
    const disclosure = q.button("Accept invite");
    await disclosure.click();

    const popover = q.dialog("Team meeting");
    await test.expect(popover).toBeVisible();
    const arrow = popover.locator(".arrow");

    await q.button("Show above").click();
    await test.expect.poll(() => isAbove(popover, disclosure)).toBe(true);

    const anchorBox = await getBox(disclosure);
    await test.expect
      .poll(() => getHorizontalCenter(arrow))
      .toBeGreaterThanOrEqual(anchorBox.x);
    await test.expect
      .poll(() => getHorizontalCenter(arrow))
      .toBeLessThanOrEqual(anchorBox.x + anchorBox.width);
  });
});
