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
