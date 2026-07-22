import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getVerticalCenter(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Element has no bounding box");
  }
  return box.y + box.height / 2;
}

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/3729
  test("positions the popover next to the explicit anchor", async ({ q }) => {
    const disclosure = q.button("Accept invite");
    await test.expect(disclosure).toHaveAttribute("aria-haspopup", "dialog");
    await disclosure.click();
    await test.expect(disclosure).toHaveAttribute("aria-expanded", "true");

    const anchor = q.text("Different anchor");
    const popover = q.dialog("Invitation details");
    await test.expect(popover).toBeVisible();

    const anchorCenter = await getVerticalCenter(anchor);
    const popoverCenter = await getVerticalCenter(popover);
    test.expect(Math.abs(popoverCenter - anchorCenter)).toBeLessThanOrEqual(1);
  });
});
