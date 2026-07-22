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
  for (const label of ["Disclosure first", "Anchor first"]) {
    test(`positions the popover next to the explicit anchor when the ${label.toLowerCase()}`, async ({
      q,
    }) => {
      const disclosure = q.button(`Open ${label}`);
      await test.expect(disclosure).toHaveAttribute("aria-haspopup", "dialog");
      await disclosure.click();
      await test.expect(disclosure).toHaveAttribute("aria-expanded", "true");

      const anchor = q.text(`${label} anchor`);
      const popover = q.dialog(`${label} details`);
      await test.expect(popover).toBeVisible();

      const anchorCenter = await getVerticalCenter(anchor);
      const popoverCenter = await getVerticalCenter(popover);
      test
        .expect(Math.abs(popoverCenter - anchorCenter))
        .toBeLessThanOrEqual(1);
    });
  }

  test("falls back to the disclosure when the explicit anchor unmounts", async ({
    q,
  }) => {
    const label = "Disclosure first";
    const disclosure = q.button(`Open ${label}`);
    const popover = q.dialog(`${label} details`);

    await disclosure.click();
    await test.expect(popover).toBeVisible();
    await q.button(`Remove ${label} anchor`).click();
    await test.expect(q.text(`${label} anchor`)).toHaveCount(0);

    await test.expect
      .poll(async () => {
        const disclosureCenter = await getVerticalCenter(disclosure);
        const popoverCenter = await getVerticalCenter(popover);
        return Math.abs(popoverCenter - disclosureCenter);
      })
      .toBeLessThanOrEqual(1);
  });
});
