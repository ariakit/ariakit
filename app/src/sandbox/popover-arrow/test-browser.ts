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

async function getHorizontalCenter(locator: Locator) {
  const box = await getBox(locator);
  return box.x + box.width / 2;
}

async function isAbove(locator: Locator, reference: Locator) {
  const box = await getBox(locator);
  const referenceBox = await getBox(reference);
  return box.y + box.height <= referenceBox.y;
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
 * Returns the distance between the top edge of the popup and the top edge of
 * its arrow.
 */
async function getArrowTopInset(popup: Locator) {
  const popupBox = await getBox(popup);
  const arrowBox = await getBox(popup.locator(".arrow"));
  return arrowBox.y - popupBox.y;
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
  // See https://github.com/ariakit/ariakit/issues/6320
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
  test("arrow stays clear of the rounded end of a pill tooltip near the viewport side", async ({
    q,
  }) => {
    const anchor = q.button("Star");
    await anchor.hover();
    const tooltip = q.tooltip("Add to favorites");
    await test.expect(tooltip).toBeVisible();
    await test.expect.poll(() => isAbove(tooltip, anchor)).toBe(true);

    // The anchor is too close to the viewport side for the tooltip to center on
    // it, so the arrow moves toward the bottom-left corner. It must stop where
    // the curved end of the pill meets the straight bottom side.
    const radius = await getPillRadius(tooltip);
    await test.expect
      .poll(() => getArrowLeftInset(tooltip))
      .toBeCloseTo(radius, 0);
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

  // See https://github.com/ariakit/ariakit/issues/8090
  test("arrow reaches a square corner next to it when the other corners are rounded", async ({
    q,
  }) => {
    await q.radio("Bubble").check();
    const anchor = q.button("Star");
    await anchor.hover();
    const tooltip = q.tooltip("Add to favorites");
    await test.expect(tooltip).toBeVisible();
    // The bubble rounds every corner but the bottom-left one. The arrow renders
    // on the bottom side, so neither the rounded top corners nor the rounded
    // bottom-right corner keep it from the minimum 4px padding on the left.
    await test.expect.poll(() => getArrowLeftInset(tooltip)).toBeCloseTo(4, 0);
  });

  // See https://github.com/ariakit/ariakit/issues/8090
  test("explicit arrowPadding takes precedence over the corner radius", async ({
    q,
  }) => {
    await q.checkbox("Zero arrow padding").check();
    const anchor = q.button("Star");
    await anchor.hover();
    const tooltip = q.tooltip("Add to favorites");
    await test.expect(tooltip).toBeVisible();
    // With an explicit zero padding, the arrow can move up to the corner of the
    // pill, even under its curved end.
    await test.expect.poll(() => getArrowLeftInset(tooltip)).toBeCloseTo(0, 0);
  });

  // See https://github.com/ariakit/ariakit/issues/8090
  test("arrow keeps off the vertical extent of the corners on a vertical side", async ({
    q,
  }) => {
    await q.button("Filters").click();
    const popover = q.dialog("Filters");
    await test.expect(popover).toBeVisible();
    // The popover on the right of the anchor slides down to stay inside the
    // viewport, so the arrow moves toward the top-left corner. That corner's
    // elliptical radius is 20px tall, so the arrow stops 20px from the top
    // edge.
    await test.expect.poll(() => getArrowTopInset(popover)).toBeCloseTo(20, 0);
  });

  // See https://github.com/ariakit/ariakit/issues/8090
  test("arrow keeps off the horizontal extent of the corners on a horizontal side", async ({
    q,
  }) => {
    await q.radio("Below").check();
    await q.button("Filters").click();
    const popover = q.dialog("Filters");
    await test.expect(popover).toBeVisible();
    // The popover below the anchor slides right to stay inside the viewport, so
    // the arrow moves toward the top-left corner. That corner's elliptical
    // radius is 8px wide, so the arrow stops 8px from the left edge.
    await test.expect.poll(() => getArrowLeftInset(popover)).toBeCloseTo(8, 0);
  });

  const cases = [
    // A 1px ring is detected by the current width regex, but the arrow stroke
    // must also match the ring color instead of the inherited text color.
    { label: "Thin ring", strokeWidth: "2px" },
    // Spread widths whose px text contains a 0 digit (10px) are rejected by
    // the current regex, leaving the arrow with no stroke at all.
    { label: "Thick ring", strokeWidth: "20px" },
    // Fractional widths (0.5px) are rejected too, and must round up like the
    // border-width path does (Math.ceil), so 0.5px draws a 1px ring.
    { label: "Fractional ring", strokeWidth: "2px" },
    // Tailwind v3 multi-shadow rings: zero-spread placeholders are skipped and
    // the ring segment provides both the width and the color.
    { label: "Tailwind ring", strokeWidth: "6px" },
    // Inset rings hug the popover edge like a border, and the inset keyword
    // must not leak into the inferred ring color.
    { label: "Inset ring", strokeWidth: "4px" },
    // A ring with an omitted color defaults to currentColor, so the stroke
    // must resolve to the popover's text color, not its border color.
    {
      label: "Current color ring",
      strokeWidth: "4px",
      stroke: "rgb(220, 38, 38)",
    },
  ];

  // See https://github.com/ariakit/ariakit/issues/6321
  for (const { label, strokeWidth, stroke } of cases) {
    test(`arrow stroke matches the ${label.toLowerCase()} box-shadow`, async ({
      q,
    }) => {
      await q.button(label).click();
      const dialog = q.dialog(label);
      await test.expect(dialog).toBeVisible();
      // The arrow SVG paths inherit the stroke and stroke-width set on the
      // arrow element, so the computed values on the arrow are what the user
      // sees drawn around the arrow notch.
      const arrow = dialog.locator(".arrow");
      await test.expect(arrow).toHaveCSS("stroke", stroke ?? ringColor);
      await test.expect(arrow).toHaveCSS("stroke-width", strokeWidth);
    });
  }
});
